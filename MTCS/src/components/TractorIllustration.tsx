import React from "react";
import { useTheme } from "@mui/material";
import "../index.css";

interface TractorIllustrationProps {
  width?: number | string;
  height?: number | string;
}

const TractorIllustration: React.FC<TractorIllustrationProps> = ({
  width = "100%",
  height = "100%",
}) => {
  const theme = useTheme();
  const primaryColor = theme.palette.mtcs.primary;
  // Use a standard shipping container color
  const containerColor = "#2B65EC"; // Container blue

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="tractor-svg"
    >
      {/* ===== SKY AND SUN ===== */}
      <g id="sky">
        {/* Sun */}
        <g id="sun">
          {/* Sun Rays */}
          <g className="sun-rays">
            <path
              d="M700,120 L740,120 M660,120 L620,120 M700,80 L700,40 M700,160 L700,200
                 M735,155 L765,185 M665,85 L635,55 M735,85 L765,55 M665,155 L635,185"
              stroke="#FFD43B"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>

          {/* Sun Body */}
          <circle
            cx="700"
            cy="120"
            r="35"
            fill="#FFD700"
            className="sun-body"
          />

          {/* Inner Glow */}
          <circle cx="700" cy="120" r="25" fill="#FFFFFF" opacity="0.4" />
        </g>

        {/* Clouds - Repositioned for better composition */}
        <g id="cloud-1" className="cloud-standard cloud-1">
          <path
            d="M150,100 
               C160,80 180,80 190,90 
               C200,70 230,70 240,90
               C250,80 270,85 270,100
               C270,115 250,125 230,125
               C220,135 200,135 190,125
               C180,130 160,130 150,120
               C140,130 120,120 120,105
               C120,90 140,85 150,100"
            fill="white"
          />
        </g>

        <g id="cloud-2" className="cloud-standard cloud-2">
          <path
            d="M350,150 
               C365,135 390,135 400,150 
               C410,130 440,130 450,150
               C460,140 480,145 480,160
               C480,175 460,185 440,185
               C430,195 410,195 400,185
               C390,190 370,190 360,180
               C350,190 330,180 330,165
               C330,150 340,140 350,150"
            fill="white"
          />
        </g>

        <g id="cloud-3" className="cloud-standard cloud-3">
          <path
            d="M550,80 
               C565,65 590,65 600,80 
               C610,60 640,60 650,80
               C660,70 680,75 680,90
               C680,105 660,115 640,115
               C630,125 610,125 600,115
               C590,120 570,120 560,110
               C550,120 530,110 530,95
               C530,80 540,70 550,80"
            fill="white"
          />
        </g>

        <g id="cloud-4" className="cloud-standard cloud-4">
          <path
            d="M50,200 
               C65,180 90,180 100,195 
               C110,175 140,175 150,195
               C160,185 180,190 180,205
               C180,220 160,230 140,230
               C130,240 110,240 100,230
               C90,235 70,235 60,225
               C50,235 30,225 30,210
               C30,195 40,185 50,200"
            fill="white"
          />
        </g>

        <g id="cloud-5" className="cloud-standard cloud-5">
          <path
            d="M650,250 
               C665,230 690,230 700,245 
               C710,225 740,225 750,245
               C760,235 780,240 780,255
               C780,270 760,280 740,280
               C730,290 710,290 700,280
               C690,285 670,285 660,275
               C650,285 630,275 630,260
               C630,245 640,235 650,250"
            fill="white"
          />
        </g>

        <g id="cloud-6" className="cloud-standard cloud-6">
          <path
            d="M250,300 
               C265,280 290,280 300,295 
               C310,275 340,275 350,295
               C360,285 380,290 380,305
               C380,320 360,330 340,330
               C330,340 310,340 300,330
               C290,335 270,335 260,325
               C250,335 230,325 230,310
               C230,295 240,285 250,300"
            fill="white"
          />
        </g>

        {/* Wind Effect - Added streaks to show motion */}
        <g id="wind-effects">
          <path
            className="wind-streak"
            d="M100,240 C150,240 170,235 220,235"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            className="wind-streak"
            d="M50,270 C120,270 150,265 200,265"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            className="wind-streak"
            d="M120,300 C180,300 230,295 280,295"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            className="wind-streak"
            d="M70,330 C130,330 190,325 240,325"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            className="wind-streak"
            d="M100,360 C160,360 210,355 260,355"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
          />
        </g>
      </g>

      {/* ===== ROAD SECTION ===== */}
      <g id="road-section">
        {/* Truck Shadow */}
        <ellipse
          cx="365"
          cy="525"
          rx="320"
          ry="30"
          fill="black"
          opacity="0.2"
        />
      </g>

      {/* ===== TRUCK SECTION ===== */}
      <g id="truck" transform="translate(0, 50)">
        {/* Truck Shadow - Adjusted for floating effect */}
        <ellipse
          cx="400"
          cy="520"
          rx="300"
          ry="20"
          fill="rgba(0,0,0,0.15)"
          opacity="0.7"
          filter="blur(10px)"
        />

        {/* Truck Cab */}
        <g id="truck-cab">
          {/* Cab Base */}
          <rect x="150" y="320" width="180" height="130" rx="20" fill="white" />
          <rect x="130" y="330" width="20" height="100" rx="5" fill="black" />

          {/* Cab Highlights */}
          <path
            d="M150,320 L320,320 Q330,320 330,330 L330,370 Q280,380 250,365 Q220,380 160,365 L150,330 Q150,320 150,320 Z"
            fill="white"
            opacity="0.2"
          />

          {/* Cab Details */}
          <path
            d="M190,350 L290,350 Q295,350 295,355 L295,410 Q295,415 290,415 L190,415 Q185,415 185,410 L185,355 Q185,350 190,350 Z"
            fill="#A5D6F9"
            stroke="#333"
            strokeWidth="2"
          />
          <rect x="300" y="370" width="25" height="40" rx="3" fill="#A5D6F9" />
          <rect x="290" y="385" width="10" height="3" rx="1" fill="#CCCCCC" />

          {/* Headlights */}
          <circle
            cx="170"
            cy="390"
            r="12"
            fill="#FFDD99"
            stroke="#888888"
            strokeWidth="1"
          />
          <circle cx="170" cy="390" r="6" fill="white" />

          {/* Grill */}
          <rect x="140" y="370" width="30" height="40" rx="3" fill="#444444" />
          <rect x="145" y="375" width="20" height="2" fill="#777777" />
          <rect x="145" y="380" width="20" height="2" fill="#777777" />
          <rect x="145" y="385" width="20" height="2" fill="#777777" />
          <rect x="145" y="390" width="20" height="2" fill="#777777" />
          <rect x="145" y="395" width="20" height="2" fill="#777777" />
          <rect x="145" y="400" width="20" height="2" fill="#777777" />
        </g>

        {/* Connector Between Cab and Trailer */}
        <g id="connector">
          <rect x="330" y="350" width="30" height="100" fill="#444444" />
          <rect x="335" y="380" width="20" height="5" fill="#888888" />
          <rect x="335" y="390" width="20" height="5" fill="#888888" />
        </g>

        {/* Container/Trailer */}
        <g id="container">
          {/* Container Base */}
          <rect
            x="360"
            y="300"
            width="320"
            height="150"
            rx="5"
            fill={containerColor}
            stroke="#333333"
            strokeWidth="1"
          />

          {/* Container Top Rail */}
          <rect x="360" y="300" width="320" height="15" fill="#333333" />

          {/* Container Bottom Rail */}
          <rect x="360" y="435" width="320" height="15" fill="#333333" />

          {/* Container Vertical Ridges */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <rect
              key={i}
              x={365 + i * 35}
              y="315"
              width="5"
              height="120"
              fill="#1A4B8F"
              opacity="0.7"
            />
          ))}

          {/* Container Horizontal Ridges */}
          <rect
            x="360"
            y="350"
            width="320"
            height="5"
            fill="#1A4B8F"
            opacity="0.7"
          />
          <rect
            x="360"
            y="395"
            width="320"
            height="5"
            fill="#1A4B8F"
            opacity="0.7"
          />

          {/* Container Corner Fittings */}
          <rect x="360" y="300" width="15" height="15" fill="#333333" />
          <rect x="665" y="300" width="15" height="15" fill="#333333" />
          <rect x="360" y="435" width="15" height="15" fill="#333333" />
          <rect x="665" y="435" width="15" height="15" fill="#333333" />

          {/* Container Door Outline */}
          <rect
            x="660"
            y="315"
            width="15"
            height="120"
            fill="#1A4B8F"
            stroke="#333333"
            strokeWidth="1"
          />

          {/* Container Door Handle */}
          <rect x="665" y="365" width="10" height="20" fill="#333333" />
          <circle cx="670" cy="375" r="3" fill="#555555" />
        </g>

        {/* Wheels Group */}
        <g id="wheels">
          {/* Front Wheel - Add rotation animation */}
          <g id="front-wheel" className="front-wheel">
            <circle cx="210" cy="450" r="40" fill="#111111" />
            <circle cx="210" cy="450" r="30" fill="#333333" />
            <circle cx="210" cy="450" r="20" fill="#555555" />
            <circle cx="210" cy="450" r="5" fill="#888888" />
            <path
              d="M210,430 L210,470 M190,450 L230,450"
              stroke="#888888"
              strokeWidth="2"
            />
            <path
              d="M195,435 L225,465 M195,465 L225,435"
              stroke="#888888"
              strokeWidth="2"
            />
          </g>

          {/* Middle Wheel - Add rotation animation */}
          <g id="middle-wheel" className="middle-wheel">
            <circle cx="380" cy="450" r="40" fill="#111111" />
            <circle cx="380" cy="450" r="30" fill="#333333" />
            <circle cx="380" cy="450" r="20" fill="#555555" />
            <circle cx="380" cy="450" r="5" fill="#888888" />
            <path
              d="M380,430 L380,470 M360,450 L400,450"
              stroke="#888888"
              strokeWidth="2"
            />
            <path
              d="M365,435 L395,465 M365,465 L395,435"
              stroke="#888888"
              strokeWidth="2"
            />
          </g>

          {/* Back Wheel - Add rotation animation */}
          <g id="back-wheel" className="back-wheel">
            <circle cx="600" cy="450" r="40" fill="#111111" />
            <circle cx="600" cy="450" r="30" fill="#333333" />
            <circle cx="600" cy="450" r="20" fill="#555555" />
            <circle cx="600" cy="450" r="5" fill="#888888" />
            <path
              d="M600,430 L600,470 M580,450 L620,450"
              stroke="#888888"
              strokeWidth="2"
            />
            <path
              d="M585,435 L615,465 M585,465 L615,435"
              stroke="#888888"
              strokeWidth="2"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default TractorIllustration;
