import { memo } from "react";

export const RouteEdge = memo(function RouteEdge({
  id,
  d,
  active,
  edgeIndex
}: {
  id: string;
  d: string;
  active: boolean;
  edgeIndex: number;
}) {
  return (
    <g>
      <path id={id} d={d} className={`route-edge ${active ? "active" : ""}`} />
      {active ? (
        <circle r="2.5" fill="var(--color-accent-cyan)">
          <animateMotion dur="3s" begin={`${edgeIndex * 0.3}s`} repeatCount="indefinite">
            <mpath href={`#${id}`} />
          </animateMotion>
        </circle>
      ) : null}
    </g>
  );
});
