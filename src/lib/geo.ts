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

/**
 * Generate a smooth SVG path through projected sea waypoints using
 * Catmull-Rom → cubic Bézier conversion.
 *
 * The resulting path passes exactly through every waypoint with C1
 * continuity (smooth tangents at every junction). Compatible with
 * SVG <animateMotion> and <mpath>.
 *
 * @param x1 - Source port projected x
 * @param y1 - Source port projected y
 * @param waypoints - Projected intermediate waypoint coordinates
 * @param x2 - Destination port projected x
 * @param y2 - Destination port projected y
 * @returns Valid SVG path string (M + C commands)
 */
export function calculateSeaRoutePath(
  x1: number,
  y1: number,
  waypoints: { x: number; y: number }[],
  x2: number,
  y2: number
): string {
  // Full point sequence: source → waypoints → destination
  const pts = [
    { x: x1, y: y1 },
    ...waypoints,
    { x: x2, y: y2 },
  ];
  const n = pts.length;

  // Degenerate: fewer than 2 points → straight line
  if (n < 2) return `M ${x1} ${y1} L ${x2} ${y2}`;

  let d = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 0; i < n - 1; i++) {
    // Catmull-Rom uses 4 points per segment; clamp at boundaries
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];

    // Convert Catmull-Rom segment [p1→p2] to cubic Bézier control points
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
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
