"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

import { statusToHex } from "@/lib/colors";
import { PORTS } from "@/lib/portData";
import { ROUTES } from "@/lib/routeData";
import { useAtlasStore } from "@/store";

type NodeDatum = d3.SimulationNodeDatum & { id: number; name: string; radius: number };
type LinkDatum = d3.SimulationLinkDatum<NodeDatum> & { source: string | NodeDatum; target: string | NodeDatum; traffic: number };

export function NetworkGraph() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const currentHop = useAtlasStore((state) => state.currentHop);
  const riskData = useAtlasStore((state) => state.riskData);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = 760;
    const height = 560;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const nodes: NodeDatum[] = PORTS.map((port) => ({
      id: port.id,
      name: port.name,
      radius: 8 + Math.min(34, ((riskData[String(port.id)]?.feature_breakdown.betweenness_norm ?? 30) / 100) * 34)
    }));
    const links: LinkDatum[] = ROUTES.map((route) => ({
      source: String(route.source_port),
      target: String(route.destination_port),
      traffic: route.traffic_volume
    }));

    const simulation = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink<NodeDatum, LinkDatum>(links).id((d) => String(d.id)).distance((d) => Number(d.traffic) / 5000 * 40 + 30))
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<NodeDatum>().radius((d) => d.radius + 2));
    simulation.stop();
    for (let i = 0; i < 1000; i += 1) {
      simulation.tick();
      if (simulation.alpha() < simulation.alphaMin()) break;
    }

    const link = svg
      .append("g")
      .attr("stroke", "var(--color-border)")
      .attr("stroke-opacity", 0.7)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("x1", (d) => (d.source as NodeDatum).x ?? 0)
      .attr("y1", (d) => (d.source as NodeDatum).y ?? 0)
      .attr("x2", (d) => (d.target as NodeDatum).x ?? 0)
      .attr("y2", (d) => (d.target as NodeDatum).y ?? 0)
      .attr("stroke-width", (d) => Math.max(0.5, Math.min(3, d.traffic / 2200)));
    link.append("title").text((d) => `${(d.source as NodeDatum).name} -> ${(d.target as NodeDatum).name}`);

    svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("class", "port-node")
      .attr("cx", (d) => d.x ?? 0)
      .attr("cy", (d) => d.y ?? 0)
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => statusToHex(useAtlasStore.getState().portStatuses[String(d.id)] ?? "normal"))
      .attr("stroke", "rgba(255,255,255,0.8)")
      .attr("stroke-width", 1)
      .on("click", (_, d) => useAtlasStore.getState().setSelectedPortId(String(d.id)));

    svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d) => (d.x ?? 0) + d.radius + 6)
      .attr("y", (d) => (d.y ?? 0) + 4)
      .attr("fill", "var(--color-text-secondary)")
      .attr("font-size", 9)
      .attr("font-family", "var(--font-mono)")
      .text((d) => d.name);

    const unsubscribe = useAtlasStore.subscribe(
      (state) => state.portStatuses,
      (statuses) => {
        d3.select(svgRef.current)
          .selectAll<SVGCircleElement, NodeDatum>("circle.port-node")
          .attr("fill", (d) => statusToHex(statuses[String(d.id)] ?? "normal"));
      }
    );
    return () => {
      unsubscribe();
      simulation.stop();
      svg.selectAll("*").remove();
    };
  }, [riskData]);

  useEffect(() => {
    if (currentHop < 0) return;
    const svg = d3.select(svgRef.current);
    const transitions = useAtlasStore.getState().currentResult?.state_transitions.filter((item) => item.hop === currentHop) ?? [];
    transitions.forEach((transition) => {
      const node = svg.selectAll<SVGCircleElement, NodeDatum>("circle.port-node").filter((d) => d.id === transition.port_id).datum();
      if (!node) return;
      svg
        .append("circle")
        .attr("cx", node.x ?? 0)
        .attr("cy", node.y ?? 0)
        .attr("r", 0)
        .attr("fill", "none")
        .attr("stroke", "var(--color-accent-cyan)")
        .attr("opacity", 0.7)
        .transition()
        .duration(500)
        .attr("r", node.radius + 30)
        .attr("opacity", 0)
        .remove();
    });
  }, [currentHop]);

  return (
    <div className="network-canvas">
      <svg ref={svgRef} />
    </div>
  );
}
