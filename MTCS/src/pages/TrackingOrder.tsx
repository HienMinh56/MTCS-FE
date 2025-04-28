import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  InputAdornment,
  TextField,
  Button,
  IconButton
} from "@mui/material";
import { 
  LocationOn,
  AccessTime,
  CheckCircle,
  Phone,
  PersonPin,
  DirectionsCar,
  LocalShipping,
  Close,
  Search as SearchIcon
} from "@mui/icons-material";
import { trackingOrder } from "../services/orderApi";
import { getGeocodeByAddress } from "../services/mapApi";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs"; // Thêm lại import dayjs
import { useTheme } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StraightenIcon from "@mui/icons-material/Straighten";
// Add SignalR client import
import * as signalR from "@microsoft/signalr";
// Define types based on the response structure
interface Driver {
  driverId: string;
  fullName: string;
  phoneNumber: string;
}

interface Vehicle {
  tractorId?: string;
  trailerId?: string;
  licensePlate: string;
}

interface TripStatusHistory {
  historyId: string;
  tripId: string;
  statusId: string;
  statusName: string;
  startTime: string;
}

interface Trip {
  tripId: string;
  orderId: string;
  driverId: string;
  tractorId: string;
  trailerId: string;
  startTime: string;
  endTime: string;
  status: string;
  matchTime: string;
  driver: Driver;
  tractor: Vehicle;
  trailer: Vehicle;
  tripStatusHistories: TripStatusHistory[];
}

interface OrderTrackingData {
  orderId: string;
  trackingCode: string;
  customerName: string;
  pickUpDate: string;
  deliveryDate: string;
  status: string;
  pickUpLocation: string;
  deliveryLocation: string;
  trips: Trip[];
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationWithCoords {
  name: string;
  coordinates?: Coordinates;
}

// Add WebSocket tracking types
interface DriverLocation {
  lat: number;
  lng: number;
  timestamp?: string;
}

// Function to get status display in Vietnamese
const getStatusDisplay = (status: string) => {
  switch (status) {
    case "Pending":
      return { label: "Chờ xử lý", color: "warning" };
    case "Scheduled":
      return { label: "Đã lên lịch", color: "info" };
    case "Delivering":
      return { label: "Đang giao hàng", color: "info" };
    case "Shipped":
      return { label: "Đã giao hàng", color: "info" };
    case "Completed":
      return { label: "Hoàn thành", color: "success" };
    default:
      return { label: status || "Không xác định", color: "default" };
  }
};

// Styled components for better visuals
const StatusChip = styled(Chip)(({ theme, status }: { theme: any, status: string }) => ({
  fontWeight: 600,
  backgroundColor: status === 'Completed' ? theme.palette.success.light : 
                  status === 'In Progress' ? theme.palette.info.light :
                  status === 'Pending' ? theme.palette.warning.light : 
                  theme.palette.error.light,
  color: status === 'Completed' ? theme.palette.success.contrastText : 
         status === 'In Progress' ? theme.palette.info.contrastText :
         status === 'Pending' ? theme.palette.warning.contrastText : 
         theme.palette.error.contrastText,
}));

const LocationCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  }
}));

const MapContainer = styled(Paper)(({ theme }) => ({
  height: '400px',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

// Create styled components for driver tracking controls
const MapControlsContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '10px',
  right: '10px',
  padding: theme.spacing(2),
  zIndex: 1000,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  maxWidth: '300px',
}));

const ConnectionStatus = styled(Box)(({ theme, status }: { theme: any, status: 'connecting' | 'connected' | 'disconnected' | 'receiving' }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  color: status === 'connected' ? theme.palette.success.main :
         status === 'receiving' ? theme.palette.info.main :
         status === 'connecting' ? theme.palette.warning.main :
         theme.palette.error.main
}));

const StatusIndicator = styled('span')(({ theme, status }: { theme: any, status: 'connecting' | 'connected' | 'disconnected' | 'receiving' }) => ({
  display: 'inline-block',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  marginRight: theme.spacing(1),
  backgroundColor: status === 'connected' ? theme.palette.success.main :
                   status === 'receiving' ? theme.palette.info.main :
                   status === 'connecting' ? theme.palette.warning.main :
                   theme.palette.error.main
}));

const TrackingOrder: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { trackingCode: urlTrackingCode } = useParams<{ trackingCode?: string }>();
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<{
    pickup?: LocationWithCoords;
    delivery?: LocationWithCoords;
  }>({});

  const handleGoBack = () => {
    navigate(-1);
  };

  // Add state for driver tracking
  const [driverId, setDriverId] = useState<string>("");
  const [driverName, setDriverName] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'receiving'>('disconnected');
  const [trackingActive, setTrackingActive] = useState<boolean>(false);
  const socketRef = useRef<signalR.HubConnection | null>(null);
  const mapRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const driverPathRef = useRef<any>(null);
  const pathCoordinatesRef = useRef<[number, number][]>([]);
  // Add reference for driver to delivery route
  const driverToDeliveryPathRef = useRef<any>(null);
  const apiKeyRef = useRef<string>("");

  // Create refs for markers to access them later for focusing
  const pickupMarkerRef = useRef<any>(null);
  const deliveryMarkerRef = useRef<any>(null);
  
  // Function to focus map on a specific marker
  const focusMapOnMarker = (marker: any, zoom: number = 16) => {
    if (!mapRef.current || !marker) return;
    
    const map = mapRef.current;
    map.flyTo({
      center: marker.getLngLat(),
      zoom: zoom,
      duration: 1000
    });
    
    // Open the marker's popup if it has one
    if (marker.getPopup) {
      marker.togglePopup();
    }
  };
  
  // Function to focus on driver's current location
  const focusOnDriverLocation = () => {
    if (!driverMarkerRef.current || !mapRef.current) return;
    
    focusMapOnMarker(driverMarkerRef.current, 16);
  };
  
  // Function to focus on pickup location
  const focusOnPickupLocation = () => {
    if (!pickupMarkerRef.current || !mapRef.current) return;
    
    focusMapOnMarker(pickupMarkerRef.current);
  };
  
  // Function to focus on delivery location
  const focusOnDeliveryLocation = () => {
    if (!deliveryMarkerRef.current || !mapRef.current) return;
    
    focusMapOnMarker(deliveryMarkerRef.current);
  };

  // Function to fetch order tracking data
  const handleTrackOrder = async () => {
    if (!trackingCode.trim()) {
      setError("Vui lòng hãy nhập mã vận chuyển");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await trackingOrder(trackingCode);
      setTrackingData(response.data);

      // Get geocoding for locations
      const fetchLocations = async () => {
        try {
          const pickupCoords = await getGeocodeByAddress(response.data.pickUpLocation);
          const deliveryCoords = await getGeocodeByAddress(response.data.deliveryLocation);

          setLocations({
            pickup: {
              name: response.data.pickUpLocation,
              coordinates: pickupCoords || undefined
            },
            delivery: {
              name: response.data.deliveryLocation,
              coordinates: deliveryCoords || undefined
            }
          });
        } catch (error) {
          console.error("Error fetching location coordinates:", error);
        }
      };

      fetchLocations();
    } catch (err: any) {
      console.error("Error tracking order:", err);
      // Check for specific error types
      if (err.message === "ORDER_COMPLETED") {
        setError("Đơn hàng đã hoàn thành không thể tiến hành theo dõi.");
      } else if (err.message === "ORDER_PENDING") {
        setError("Đơn hàng chưa bắt đầu vận chuyển và vẫn đang chờ xử lý.");
      } else if (err.message === "ORDER_SCHEDULED") {
        setError("Đơn hàng chưa bắt đầu vận chuyển nhưng đã lên lịch.");
      } else if (err.message === "ORDER_SHIPPED") {
        setError("Đơn hàng đã vận chuyển.");
      } else {
        setError("Không thể tìm thấy mã vận chuyển của bạn. Vui lòng kiểm tra xem mã có đã đúng hay không.");
      }
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch tracking data if tracking code is provided in URL
  useEffect(() => {
    if (urlTrackingCode) {
      setTrackingCode(urlTrackingCode);
      handleTrackOrder();
    }
  }, [urlTrackingCode]);

  // Sort trip status histories by startTime
  const sortedStatuses = useMemo(() => {
    if (!trackingData?.trips[0]?.tripStatusHistories) return [];
    
    return [...trackingData.trips[0].tripStatusHistories].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [trackingData]);

  // Function to handle stopping driver tracking
  const handleStopTracking = () => {
    // Stop tracking
    if (socketRef.current) {
      // First unsubscribe from the user's location updates if connected
      if (socketRef.current.state === signalR.HubConnectionState.Connected && driverId) {
        socketRef.current.invoke("Unsubscribe", driverId)
          .catch(err => {
            console.error("Error unsubscribing from driver location:", err);
          });
      }

      // Then stop the connection
      socketRef.current.stop().catch(err => {
        console.error("Error stopping SignalR connection:", err);
      });
      socketRef.current = null;
    }

    // Remove driver marker from map
    if (driverMarkerRef.current && mapRef.current) {
      driverMarkerRef.current.remove();
      driverMarkerRef.current = null;
    }

    // Remove driver path from map
    if (driverPathRef.current && mapRef.current) {
      driverPathRef.current.remove();
      driverPathRef.current = null;
    }

    // Reset path coordinates
    pathCoordinatesRef.current = [];
    
    setConnectionStatus('disconnected');
    setTrackingActive(false);
  };

  // Function to connect to SignalR hub
  const connectSignalR = (userId: string) => {
    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.stop();
    }
    
    setConnectionStatus('connecting');
    console.log(`Connecting to SignalR hub for driver: ${userId}`);
    
    // Connect to SignalR hub with proper configuration
    socketRef.current = new signalR.HubConnectionBuilder()
      .withUrl("https://mtcs-server.azurewebsites.net/locationHub", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 15000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Handle location updates
    socketRef.current.on("ReceiveLocation", (receivedUserId: string, latitude: number, longitude: number) => {
      console.log(`SignalR message received for user ${receivedUserId}:`, { latitude, longitude });
      
      // Only update if the location is for our driver
      if (receivedUserId === userId) {
        updateDriverLocation(latitude, longitude);
        setConnectionStatus('receiving');
      }
    });
    
    // Start the connection and subscribe to the user's location updates
    let retryCount = 0;
    const maxRetries = 3;
    
    function attemptConnection() {
      retryCount++;
      console.log(`SignalR connection attempt ${retryCount}/${maxRetries}`);
      
      socketRef.current!.start()
        .then(() => {
          console.log(`SignalR connection opened for driver: ${userId}`);
          setConnectionStatus('connected');
          
          // Subscribe to the user location updates
          return socketRef.current!.invoke("Subscribe", userId);
        })
        .then(() => {
          console.log(`Successfully subscribed to location updates for driver: ${userId}`);
        })
        .catch(err => {
          console.error("Error connecting to SignalR hub:", err);
          setConnectionStatus('disconnected');
          
          if (retryCount < maxRetries) {
            console.log(`Retry attempt ${retryCount} failed. Trying again in 3 seconds...`);
            setTimeout(attemptConnection, 3000);
          } else {
            console.log(`Failed to connect after ${maxRetries} attempts`);
            setTrackingActive(false);
          }
        });
    }
    
    attemptConnection();
    
    // Handle connection closed
    socketRef.current.onclose = (error) => {
      console.log('SignalR connection closed:', error);
      setConnectionStatus('disconnected');
      setTrackingActive(false);
    };
  };

  // Function to update driver marker position on the map
  const updateDriverLocation = (lat: number, lng: number) => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const apiKey = import.meta.env.VITE_GOONG_MAP_API_KEY;
    apiKeyRef.current = apiKey;
    
    console.log("Driver location updated:", { lat, lng });
    
    // Store the new coordinates in the path history
    pathCoordinatesRef.current.push([lng, lat]);
    
    // Create or update driver marker
    if (!driverMarkerRef.current) {
      // Create a container truck icon element instead of a car
      const el = document.createElement('div');
      el.className = 'driver-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.backgroundImage = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%233f51b5\"><path d=\"M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z\"/></svg>')";

      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
      el.style.cursor = 'pointer';
      el.style.filter = 'drop-shadow(0px 3px 3px rgba(0,0,0,0.5))'; // Enhance shadow for better visibility
      
      driverMarkerRef.current = new window.goongjs.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map);
      
      driverMarkerRef.current.setPopup(
        new window.goongjs.Popup({ offset: 25 })
          .setHTML(`<h3>Vị trí tài xế</h3><p>Tên tài xế: ${driverName}</p>`)
      );
      
      // Create path polyline
      driverPathRef.current = map.addSource('driverPath', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: pathCoordinatesRef.current
          }
        }
      });
      
      map.addLayer({
        id: 'driverPathLine',
        type: 'line',
        source: 'driverPath',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#FF4081',
          'line-width': 4,
          'line-dasharray': [2, 1]
        }
      });
    } else {
      // Update existing marker
      driverMarkerRef.current.setLngLat([lng, lat]);
      
      // Update the path with new coordinates
      if (map.getSource('driverPath')) {
        map.getSource('driverPath').setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: pathCoordinatesRef.current
          }
        });
      }
    }
    
    // Vẽ đường từ vị trí tài xế đến điểm giao hàng nếu có vị trí giao hàng
    if (locations.delivery?.coordinates) {
      const deliveryCoords = locations.delivery.coordinates;
      console.log("Delivery coordinates:", deliveryCoords);
      
      // Chuẩn bị URL cho API Directions
      // CHÚ Ý: Goong API yêu cầu origin và destination theo dạng lat,lng
      const directionsUrl = `https://rsapi.goong.io/Direction?origin=${lat},${lng}&destination=${deliveryCoords.lat},${deliveryCoords.lng}&vehicle=car&api_key=${apiKey}`;

      console.log("Calling directions API:", directionsUrl);
      
      // Gọi API để lấy đường đi từ vị trí tài xế đến điểm giao hàng
      fetch(directionsUrl)
        .then(response => {
          console.log("Directions API response status:", response.status);
          return response.json();
        })
        .then(data => {
          console.log("Directions API response:", data);
          
          if (data.routes && data.routes.length > 0 && data.routes[0].overview_polyline) {
            const polyline = data.routes[0].overview_polyline.points;
            console.log("Got polyline:", polyline ? "Yes (length: " + polyline.length + ")" : "No");
            
            const decodedCoords = decodePolyline(polyline);
            console.log("Decoded coordinates count:", decodedCoords.length);
            
            if (decodedCoords.length > 0) {
              // Chuyển đổi tọa độ thành định dạng [lng, lat] cho Goong Maps
              const routeCoordinates = decodedCoords.map(coord => [coord.lng, coord.lat]);
              
              // Nếu đã có layer và source, xóa chúng trước
              if (map.getLayer('driverToDeliveryLine')) {
                map.removeLayer('driverToDeliveryLine');
              }
              
              if (map.getSource('driverToDelivery')) {
                map.removeSource('driverToDelivery');
                driverToDeliveryPathRef.current = null;
              }
              
              // Tạo mới source và layer
              map.addSource('driverToDelivery', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: routeCoordinates
                  }
                }
              });
              
              map.addLayer({
                id: 'driverToDeliveryLine',
                type: 'line',
                source: 'driverToDelivery',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': '#FFFE00',  // Thay đổi màu thành đỏ (từ #2196F3)
                  'line-width': 4,
                  'line-dasharray': [1, 2]  // Kiểu đường nét đứt
                }
              });
              
              driverToDeliveryPathRef.current = 'created';
              console.log("Driver to delivery route added to map successfully!");
            }
          } else {
            console.error("Direction API error or no routes found:", data);
          }
        })
        .catch(err => {
          console.error("Error loading driver to delivery route:", err);
        });
    } else {
      console.warn("No delivery coordinates available for routing");
    }
    
    // Animate to the new position smoothly
    if (pathCoordinatesRef.current.length === 1) {
      map.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000
      });
    }
  };

  // Helper function to decode Google/Goong Maps encoded polylines
  const decodePolyline = (encoded: string) => {
    if (!encoded) return [];
    
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;
    const coordinates = [];
    
    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      
      shift = 0;
      result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      
      coordinates.push({
        lat: lat / 1e5,
        lng: lng / 1e5
      });
    }
    
    return coordinates;
  };

  // Set driver ID and auto-start tracking when tracking data loads
  useEffect(() => {
    if (trackingData?.trips?.[0]?.driverId) {
      const tripDriverId = trackingData.trips[0].driverId;
      const driverName = trackingData.trips[0].driver.fullName;
      setDriverId(tripDriverId);
      setDriverName(driverName);
      
      // Check if both locations have coordinates before starting tracking
      if (locations.pickup?.coordinates && locations.delivery?.coordinates) {
        // Auto-start tracking if we're not already tracking
        if (!trackingActive && tripDriverId) {
          console.log("Auto-starting driver tracking for:", tripDriverId);
          console.log("Pickup coordinates:", locations.pickup.coordinates);
          console.log("Delivery coordinates:", locations.delivery.coordinates);
          connectSignalR(tripDriverId);
          setTrackingActive(true);
        }
      } else {
        console.log("Waiting for location coordinates before starting tracking:", 
          locations.pickup?.coordinates ? "Pickup ready" : "Pickup not ready", 
          locations.delivery?.coordinates ? "Delivery ready" : "Delivery not ready");
      }
    }
  }, [trackingData, trackingActive, locations]);

  // Cleanup WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.stop();
      }
    };
  }, []);

  // Load Goong Map when we have location coordinates
  useEffect(() => {
    if (!locations.pickup?.coordinates || !locations.delivery?.coordinates) return;

    // Function to initialize and render the map
    const initMap = () => {
      const mapDiv = document.getElementById('tracking-map');
      if (!mapDiv || !window.goongjs) return;

      const apiKey = import.meta.env.VITE_GOONG_MAP_API_KEY;
      const mapTileKey = import.meta.env.VITE_GOONG_MAPTILE_KEY;
      const pickupCoords = [locations.pickup!.coordinates!.lng, locations.pickup!.coordinates!.lat];
      const deliveryCoords = [locations.delivery!.coordinates!.lng, locations.delivery!.coordinates!.lat];
      
      // Set the access token with the API key
      window.goongjs.accessToken = mapTileKey;
      
      // Using the correct map style URL with mapTileKey
      const map = new window.goongjs.Map({
        container: 'tracking-map',
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: pickupCoords,
        zoom: 13
      });

      // Store the map reference for driver tracking
      mapRef.current = map;

      // Add markers when the map is loaded
      map.on('load', () => {
        // Add pickup marker
        pickupMarkerRef.current = new window.goongjs.Marker({ color: '#4CAF50' })
          .setLngLat(pickupCoords)
          .setPopup(new window.goongjs.Popup({ offset: 25 })
            .setHTML(`<h3>Nơi lấy hàng</h3><p>${locations.pickup!.name}</p>`))
          .addTo(map);

        // Add delivery marker
        deliveryMarkerRef.current = new window.goongjs.Marker({ color: '#F44336' })
          .setLngLat(deliveryCoords)
          .setPopup(new window.goongjs.Popup({ offset: 25 })
            .setHTML(`<h3>Nơi giao hàng</h3><p>${locations.delivery!.name}</p>`))
          .addTo(map);

        // Fit the map to show both markers
        const bounds = new window.goongjs.LngLatBounds();
        bounds.extend(pickupCoords);
        bounds.extend(deliveryCoords);
        map.fitBounds(bounds, { padding: 70 });

        // Add route between points if both coordinates are valid - using apiKey for directions API
        fetch(
          `https://rsapi.goong.io/Direction?origin=${pickupCoords[1]},${pickupCoords[0]}&destination=${deliveryCoords[1]},${deliveryCoords[0]}&vehicle=car&api_key=${apiKey}`
        )
          .then(response => response.json())
          .then(data => {
            console.log("Direction API response:", data);
            if (data.routes && data.routes.length > 0 && data.routes[0].overview_polyline) {
              // The Goong Direction API returns a different format than expected
              // We need to decode the overview_polyline to get the route coordinates
              const polyline = data.routes[0].overview_polyline.points;
              console.log("Found polyline points:", polyline ? "Yes" : "No");
              
              const decodedCoords = decodePolyline(polyline);
              console.log("Decoded coordinates count:", decodedCoords.length);
              
              if (decodedCoords.length > 0) {
                // Add route line
                map.addSource('route', {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'LineString',
                      coordinates: decodedCoords.map(coord => [coord.lng, coord.lat])
                    }
                  }
                });

                map.addLayer({
                  id: 'route',
                  type: 'line',
                  source: 'route',
                  layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                  },
                  paint: {
                    'line-color': '#3f51b5',
                    'line-width': 5
                  }
                });
                console.log("Route line added to map successfully!");
              } else {
                console.error("Failed to decode polyline coordinates");
              }
            } else {
              console.error("Direction API error or no routes found:", data);
            }
          })
          .catch(err => console.error("Error loading route:", err));
      });
    };

    // If goongjs is not loaded, load it first
    if (!window.goongjs) {
      const script = document.createElement('script');
      // Update to use the latest CDN version with the API key included
      script.src = `https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js`;
      script.async = true;
      script.onload = () => {
        // Also load the CSS
        const link = document.createElement('link');
        link.href = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        
        // Initialize map after CSS is loaded
        link.onload = initMap;
      };
      document.head.appendChild(script);
    } else {
      initMap();
    }

    // Cleanup function
    return () => {
      const mapDiv = document.getElementById('tracking-map');
      if (mapDiv && mapDiv.__gMap) {
        mapDiv.__gMap.remove();
      }
    };
  }, [locations]);

  // JSX for rendering trip status history as a horizontal timeline
  const renderTripTimeline = () => {
    if (!sortedStatuses.length) return null;

    // Hàm format thời gian với xử lý lỗi
    const formatDateTime = (dateTimeString: string) => {
      try {
        console.log('Raw dateTimeString value:', dateTimeString);
        
        // Nếu chuỗi thời gian rỗng hoặc null/undefined
        if (!dateTimeString) {
          return 'Không có dữ liệu thời gian';
        }
        
        // Thử parse ngày trực tiếp
        let date;
        try {
          date = new Date(dateTimeString);
          console.log('Parsed date:', date);
          
          // Kiểm tra nếu date không phải là ngày hợp lệ
          if (isNaN(date.getTime())) {
            console.warn('Invalid date after parsing:', dateTimeString);
            return 'Không có dữ liệu thời gian';
          }
        } catch (err) {
          console.error('Error parsing date:', err);
          return 'Không có dữ liệu thời gian';
        }
        
        // Format ngày tháng thủ công thay vì dùng dayjs
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        const formattedResult = `${day}/${month}/${year} ${hours}:${minutes}`;
        console.log('Formatted result:', formattedResult);
        return formattedResult;
      } catch (err) {
        console.error('Error formatting date:', err);
        return 'Không có dữ liệu thời gian';
      }
    };

    // Sử dụng horizontal timeline
    return (
      <Box sx={{ my: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
          Trạng thái vận chuyển của chuyến hàng
        </Typography>
        
        {/* Container cho timeline ngang */}
        <Box sx={{ 
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          width: '100%',
          overflowX: 'auto',
          pb: 2
        }}>
          {/* Đường kẻ ngang kết nối các điểm */}
          <Box sx={{ 
            position: 'absolute',
            top: 16, // Căn giữa điểm timeline
            left: 0,
            right: 20, // padding để đảm bảo đường kẻ không kéo dài quá mức
            height: 2,
            backgroundColor: theme.palette.primary.main,
            zIndex: 1
          }} />

          {sortedStatuses.map((status, index) => {
            // Format thời gian và lưu vào biến
            const formattedTime = formatDateTime(status.startTime);
            console.log(`Status ${index} formatted time:`, formattedTime);
            
            return (
              <Box 
                key={status.historyId} 
                sx={{ 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '180px', // Đảm bảo mỗi trạng thái có kích thước tối thiểu
                  maxWidth: '250px', // Giới hạn kích thước tối đa
                  px: 2,
                  flexShrink: 0, // Ngăn không bị co lại khi không đủ không gian
                  zIndex: 2 // Hiển thị trên đường kẻ ngang
                }}
              >
                {/* Điểm tròn trên timeline */}
                <Box sx={{ 
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: `0 0 0 1px ${theme.palette.divider}`,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {index + 1}
                  </Typography>
                </Box>
                
                {/* Chi tiết trạng thái */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {status.statusName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <AccessTime sx={{ mr: 0.5, color: theme.palette.text.secondary, fontSize: 'small' }} />
                    <Typography variant="caption" color="text.secondary">
                      {formattedTime || 'Không có dữ liệu thời gian'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  // Render driver and vehicle details card
  const renderDriverVehicleDetails = () => {
    if (!trackingData?.trips[0]?.driver) return null;
    
    const { driver, tractor, trailer } = trackingData.trips[0];
    
    return (
      <Card 
        sx={{ 
          mb: 3, 
          bgcolor: theme.palette.background.default,
          cursor: 'pointer',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
            backgroundColor: theme.palette.action.hover,
          }
        }}
        onClick={focusOnDriverLocation}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
              <PersonPin />
            </Avatar>
            <Box>
              <Typography variant="h6">{driver.fullName}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ fontSize: 'small', mr: 0.5, color: theme.palette.text.secondary }} />
                <Typography variant="body2" color="text.secondary">
                  {driver.phoneNumber}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DirectionsCar sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="subtitle2">Tractor</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tractor.licensePlate}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalShipping sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="subtitle2">Trailer</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {trailer.licensePlate}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Render driver tracking controls that overlay on the map
  const renderDriverTrackingControls = () => {
    const statusLabels = {
      'connected': 'Đã kết nối, đang đợi lấy vị trí...',
      'disconnected': 'Chưa kết nối',
      'connecting': 'Đang kết nối...',
      'receiving': `Bạn đang quan sát vị trí của tài xế`
    };

    return (
      <MapControlsContainer>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Trạng thái dò tìm vị trí tài xế</Typography>
        </Box>
        
        {/* <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
          <TextField
            size="small"
            value={driverId}
            disabled={true}
            placeholder="Driver ID"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonPin fontSize="small" />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
          
          {trackingActive && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleStopTracking}
              startIcon={<Close />}
              size="small"
              fullWidth
            >
              Stop Tracking
            </Button>
          )}
        </Box> */}
        
        <ConnectionStatus status={connectionStatus}>
          <StatusIndicator status={connectionStatus} />
          <Typography variant="body2">{statusLabels[connectionStatus]}</Typography>
        </ConnectionStatus>
      </MapControlsContainer>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, mb: 4 }}>
      <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* <IconButton
                onClick={handleGoBack}
                sx={{ mr: 1, mb: 1 }}
                color="primary"
                aria-label="back"
              >
                <ArrowBackIcon fontSize="large" />
              </IconButton> */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant= "h1"
                  component="h1"
                  fontWeight="bold"
                  color="primary.main"
                  sx= {{ mb: 2 }}
                >
                  Theo dõi đơn hàng của bạn
                </Typography>
              </Box>
            </Box>
          </Box>

        {/* Search Bar */}
        <Box sx={{ display: 'flex', mb: 4, gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Nhập mã vận chuyển của bạn"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="e.g., TRAK_20250411_091440_9489"
            error={!!error}
            helperText={error}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleTrackOrder();
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleTrackOrder}
            disabled={loading}
            sx={{ 
              px: 4,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Track"}
          </Button>
        </Box>

        {/* Loading Indicator */}
        {loading && !trackingData && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error Message */}
        {error && (
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {/* Results Section */}
        {trackingData && (
          <>
            {/* Order Basic Info */}
            <Box sx={{ mb: 4 }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  background: `linear-gradient(145deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                  color: 'white'
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" fontWeight={700}>
                      {trackingData.customerName}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                      {trackingData.trackingCode}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Chip
                      size="medium"
                      label={getStatusDisplay(trackingData.status).label}
                      color={getStatusDisplay(trackingData.status).color as any}
                      sx={{ fontWeight: 600 }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Box>

            {/* Content Grid */}
            <Grid container spacing={4}>
              {/* Left Column: Driver Info and Location Details */}
              <Grid item xs={12} md={5}>
                {/* Driver and Vehicle Card */}
                {renderDriverVehicleDetails()}

                {/* Location Cards */}
                <LocationCard 
                  elevation={2}
                  onClick={focusOnPickupLocation}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <LocationOn sx={{ mt: 0.5, mr: 1, color: theme.palette.success.main }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Nơi lấy hàng
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {trackingData.pickUpLocation}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dayjs(trackingData.pickUpDate).format('MMM D, YYYY')}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </LocationCard>

                <LocationCard 
                  elevation={2}
                  onClick={focusOnDeliveryLocation}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <LocationOn sx={{ mt: 0.5, mr: 1, color: theme.palette.error.main }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Nơi giao hàng
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {trackingData.deliveryLocation}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dayjs(trackingData.deliveryDate).format('MMM D, YYYY')}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </LocationCard>
              </Grid>

              {/* Right Column: Map */}
              <Grid item xs={12} md={7}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Tuyến đường vận chuyển
                </Typography>
                <MapContainer>
                  <div id="tracking-map" style={{ width: '100%', height: '100%' }}></div>
                  {(!locations.pickup?.coordinates || !locations.delivery?.coordinates) && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  )}
                  {locations.pickup?.coordinates && locations.delivery?.coordinates && renderDriverTrackingControls()}
                </MapContainer>
              </Grid>
              
              {/* Full Width Timeline below the map */}
              <Grid item xs={12}>
                {renderTripTimeline()}
              </Grid>
            </Grid>
          </>
        )}

        {/* No Results Message */}
        {!loading && !trackingData && !error && (
          <Box 
            sx={{ 
              py: 8, 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary'
            }}
          >
            <LocalShipping sx={{ fontSize: 60, mb: 2, opacity: 0.4 }} />
            <Typography variant="h6">Vui lòng điền mã vận chuyển của bạn để theo dõi đơn hàng.</Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

// Add TypeScript interface augmentation for the global window object
declare global {
  interface Window {
    goongjs: any;
  }
}

export default TrackingOrder;