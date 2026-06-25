"use client";

import { useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoMercator } from "d3-geo";

import { calculateBezierPath, getPerpendicularOffset, identifyBidirectionalRoutes, projectCoordinates } from "@/lib/geo";
import { PORT_BY_ID, PORTS } from "@/lib/portData";
import { ROUTES } from "@/lib/routeData";
import { useAtlasStore } from "@/store";
import type { PortStatus } from "@/types/simulation.types";
import { OceanBackground } from "./OceanBackground";
import { PortNode } from "./PortNode";
import { RouteEdge } from "./RouteEdge";

export function IndiaMap({ overrideStatuses }: { overrideStatuses?: Record<string, PortStatus> }) {
  const riskData = useAtlasStore((state) => state.riskData);
  const portStatuses = useAtlasStore((state) => state.portStatuses);
  const currentResult = useAtlasStore((state) => state.currentResult);
  const activeStatuses = overrideStatuses ?? portStatuses;
  const projection = useMemo(() => geoMercator().center([78, 21]).scale(1100).translate([480, 330]), []);
  const bidirectional = useMemo(() => identifyBidirectionalRoutes(ROUTES), []);
  const activeIds = useMemo(
    () => new Set(currentResult?.state_transitions.map((item) => item.port_id) ?? []),
    [currentResult]
  );

  const projectedPorts = useMemo(
    () =>
      PORTS.map((port) => ({
        port,
        ...projectCoordinates(port.lat, port.lon, projection)
      })),
    [projection]
  );

  const edges = useMemo(
    () =>
      ROUTES.map((route, index) => {
        const source = PORT_BY_ID.get(route.source_port)!;
        const destination = PORT_BY_ID.get(route.destination_port)!;
        const a = projectCoordinates(source.lat, source.lon, projection);
        const b = projectCoordinates(destination.lat, destination.lon, projection);
        const offset = getPerpendicularOffset(route.source_port, route.destination_port, bidirectional);
        return {
          id: `route-${route.source_port}-${route.destination_port}-${index}`,
          d: calculateBezierPath(a.x, a.y, b.x, b.y, offset),
          active: activeIds.has(route.source_port) || activeIds.has(route.destination_port)
        };
      }),
    [activeIds, bidirectional, projection]
  );

  return (
    <div className="map-canvas">
      <OceanBackground />
      <ComposableMap projection="geoMercator" projectionConfig={{ center: [78, 21], scale: 1100 }} width={960} height={660} className="india-svg">
        <Geographies geography="/india.json">
          {({ geographies }) => geographies.map((geo) => <Geography key={geo.rsmKey} geography={geo} fill="#0D1F30" stroke="#1A3045" strokeWidth={0.5} />)}
        </Geographies>
        {edges.map((edge, index) => (
          <RouteEdge key={edge.id} id={edge.id} d={edge.d} active={edge.active && !overrideStatuses} edgeIndex={index} />
        ))}
        {projectedPorts.map(({ port, x, y }) => (
          <PortNode key={port.id} port={port} x={x} y={y} riskScore={riskData[String(port.id)]?.risk_score ?? 45} />
        ))}
        {overrideStatuses
          ? Object.entries(activeStatuses).map(([id, status]) => {
              const port = PORT_BY_ID.get(Number(id));
              if (!port || status === "normal") return null;
              const point = projectCoordinates(port.lat, port.lon, projection);
              return <circle key={id} cx={point.x} cy={point.y} r="18" fill="none" stroke="var(--color-critical-red)" strokeWidth="2" opacity="0.8" />;
            })
          : null}
      </ComposableMap>
    </div>
  );
}
