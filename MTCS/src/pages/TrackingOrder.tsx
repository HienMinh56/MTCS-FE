import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
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
  IconButton,
} from "@mui/material";
import { 
  Search as SearchIcon,
  LocalShipping,
  LocationOn,
  AccessTime,
  CheckCircle,
  Phone,
  PersonPin,
  DirectionsCar
} from "@mui/icons-material";
import { trackingOrder } from "../services/orderApi";
import { getGeocodeByAddress } from "../services/mapApi";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import { useTheme } from "@mui/material/styles";

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

const TrackingOrder: React.FC = () => {
  const theme = useTheme();
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<{
    pickup?: LocationWithCoords;
    delivery?: LocationWithCoords;
  }>({});

  // Function to fetch order tracking data
  const handleTrackOrder = async () => {
    if (!trackingCode.trim()) {
      setError("Please enter a tracking code");
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
    } catch (err) {
      console.error("Error tracking order:", err);
      setError("Unable to find order with this tracking code. Please check and try again.");
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  // Sort trip status histories by startTime
  const sortedStatuses = useMemo(() => {
    if (!trackingData?.trips[0]?.tripStatusHistories) return [];
    
    return [...trackingData.trips[0].tripStatusHistories].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [trackingData]);

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

      // Add markers when the map is loaded
      map.on('load', () => {
        // Add pickup marker
        new window.goongjs.Marker()
          .setLngLat(pickupCoords)
          .setPopup(new window.goongjs.Popup({ offset: 25 })
            .setHTML(`<h3>Pickup Location</h3><p>${locations.pickup!.name}</p>`))
          .addTo(map);

        // Add delivery marker
        new window.goongjs.Marker({ color: '#F44336' })
          .setLngLat(deliveryCoords)
          .setPopup(new window.goongjs.Popup({ offset: 25 })
            .setHTML(`<h3>Delivery Location</h3><p>${locations.delivery!.name}</p>`))
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

  // JSX for rendering trip status history as a stepper
  const renderTripTimeline = () => {
    if (!sortedStatuses.length) return null;

    return (
      <Box sx={{ my: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
          Trip Status Timeline
        </Typography>
        <Stepper orientation="vertical" activeStep={sortedStatuses.length}>
          {sortedStatuses.map((status, index) => (
            <Step key={status.historyId} completed={true}>
              <StepLabel>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {status.statusName}
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTime sx={{ mr: 1, color: theme.palette.text.secondary }} fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {dayjs(status.startTime).format('MMM D, YYYY h:mm A')}
                  </Typography>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
    );
  };

  // Render driver and vehicle details card
  const renderDriverVehicleDetails = () => {
    if (!trackingData?.trips[0]?.driver) return null;
    
    const { driver, tractor, trailer } = trackingData.trips[0];
    
    return (
      <Card sx={{ mb: 3, bgcolor: theme.palette.background.default }}>
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

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, mb: 4 }}>
        <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 700 }}>
          Track Your Order
        </Typography>

        {/* Search Bar */}
        <Box sx={{ display: 'flex', mb: 4, gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Enter Tracking Code"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="e.g., TRAK_20250411_091440_9489"
            error={!!error}
            helperText={error}
            InputProps={{
              startAdornment: (
                <SearchIcon color="action" sx={{ mr: 1 }} />
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
                    <StatusChip
                      label={trackingData.status}
                      status={trackingData.status}
                      icon={trackingData.status === 'Completed' ? <CheckCircle /> : undefined}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Box>

            {/* Content Grid */}
            <Grid container spacing={4}>
              {/* Left Column: Timeline and Details */}
              <Grid item xs={12} md={5}>
                {/* Driver and Vehicle Card */}
                {renderDriverVehicleDetails()}

                {/* Location Cards */}
                <LocationCard elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <LocationOn sx={{ mt: 0.5, mr: 1, color: theme.palette.success.main }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Pickup Location
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

                <LocationCard elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <LocationOn sx={{ mt: 0.5, mr: 1, color: theme.palette.error.main }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Delivery Location
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

                {/* Trip Timeline */}
                {renderTripTimeline()}
              </Grid>

              {/* Right Column: Map */}
              <Grid item xs={12} md={7}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Delivery Route
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
                </MapContainer>
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
            <Typography variant="h6">Enter a tracking code to see order details</Typography>
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