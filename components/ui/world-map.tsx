"use client";

import { motion } from "framer-motion";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

export function WorldMap({ dots = [], lineColor = "#0ea5e9" }: MapProps) {
  // World map SVG path
  const worldPath = "M480,363L477,363L477,360L480,360L480,363ZM353,363L350,363L350,360L353,360L353,363ZM386,363L383,363L383,360L386,360L386,363ZM314,363L311,363L311,360L314,360L314,363ZM419,363L416,363L416,360L419,360L419,363ZM452,363L449,363L449,360L452,360L452,363ZM162,363L159,363L159,360L162,360L162,363ZM128,363L125,363L125,360L128,360L128,363ZM95,363L92,363L92,360L95,360L95,363ZM61,363L58,363L58,360L61,360L61,363ZM28,363L25,363L25,360L28,360L28,363ZM512,334L509,334L509,331L512,331L512,334ZM480,334L477,334L477,331L480,331L480,334ZM447,334L444,334L444,331L447,331L447,334ZM414,334L411,334L411,331L414,331L414,334ZM381,334L378,334L378,331L381,331L381,334ZM348,334L345,334L345,331L348,331L348,334ZM315,334L312,334L312,331L315,331L315,334ZM282,334L279,334L279,331L282,331L282,334ZM249,334L246,334L246,331L249,331L249,334ZM216,334L213,334L213,331L216,331L216,334ZM183,334L180,334L180,331L183,331L183,334ZM150,334L147,334L147,331L150,331L150,334ZM117,334L114,334L114,331L117,331L117,334ZM84,334L81,334L81,331L84,331L84,334ZM51,334L48,334L48,331L51,331L51,334ZM18,334L15,334L15,331L18,331L18,334ZM512,305L509,305L509,302L512,302L512,305ZM480,305L477,305L477,302L480,302L480,305ZM447,305L444,305L444,302L447,302L447,305ZM414,305L411,305L411,302L414,302L414,305ZM381,305L378,305L378,302L381,302L381,305ZM348,305L345,305L345,302L348,302L348,305ZM315,305L312,305L312,302L315,302L315,305ZM282,305L279,305L279,302L282,302L282,305ZM249,305L246,305L246,302L249,302L249,305ZM216,305L213,305L213,302L216,302L216,305ZM183,305L180,305L180,302L183,302L183,305ZM150,305L147,305L147,302L150,302L150,305ZM117,305L114,305L114,302L117,302L117,305ZM84,305L81,305L81,302L84,302L84,305ZM51,305L48,305L48,302L51,302L51,305ZM18,305L15,305L15,302L18,302L18,305Z";

  return (
    <div className="w-full h-full relative">
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full opacity-20"
      >
        <motion.path
          d={worldPath}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        
        {dots.map((connection, index) => {
          const startX = ((connection.start.lng + 180) / 360) * 800;
          const startY = ((90 - connection.start.lat) / 180) * 600;
          const endX = ((connection.end.lng + 180) / 360) * 800;
          const endY = ((90 - connection.end.lat) / 180) * 600;

          return (
            <g key={index}>
              <motion.circle
                cx={startX}
                cy={startY}
                r="2"
                fill={lineColor}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 }}
              />
              <motion.line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={lineColor}
                strokeWidth="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: index * 0.2 }}
              />
              <motion.circle
                cx={endX}
                cy={endY}
                r="2"
                fill={lineColor}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
} 