import type { RouteData } from "@/types/port.types";

export function projectCoordinates(lat: number, lon: number, projection: (point: [number, number]) => [number, number] | null) {
  const point = projection([lon, lat]);
  return { x: point?.[0] ?? 0, y: point?.[1] ?? 0 };
}

export function calculateBezierPath(x1: number, y1: number, x2: number, y2: number, offset: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const cx = mx + (-dy / length) * offset;
  const cy = my + (dx / length) * offset;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

export function identifyBidirectionalRoutes(routes: RouteData[]) {
  const seen = new Set<string>();
  const bidirectional = new Set<string>();
  routes.forEach((route) => {
    const forward = `${route.source_port}:${route.destination_port}`;
    const reverse = `${route.destination_port}:${route.source_port}`;
    if (seen.has(reverse)) {
      bidirectional.add(pairKey(route.source_port, route.destination_port));
    }
    seen.add(forward);
  });
  return bidirectional;
}

export function pairKey(a: number, b: number) {
  return `${Math.min(a, b)}:${Math.max(a, b)}`;
}

export function getPerpendicularOffset(source: number, destination: number, bidirectional: Set<string>) {
  if (!bidirectional.has(pairKey(source, destination))) return 0;
  return source < destination ? 15 : -15;
}
