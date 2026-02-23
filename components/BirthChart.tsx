
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NatalChartData } from '../types';

interface Props {
  data: NatalChartData;
}

const BirthChart: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Outer circle
    g.append("circle")
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", "rgba(255, 255, 255, 0.2)")
      .attr("stroke-width", 2);

    // Inner circle
    g.append("circle")
      .attr("r", radius * 0.7)
      .attr("fill", "none")
      .attr("stroke", "rgba(255, 255, 255, 0.1)")
      .attr("stroke-width", 1);

    // House divisions
    const houses = 12;
    for (let i = 0; i < houses; i++) {
      const angle = (i * 360) / houses;
      const x1 = Math.cos((angle * Math.PI) / 180) * radius * 0.3;
      const y1 = Math.sin((angle * Math.PI) / 180) * radius * 0.3;
      const x2 = Math.cos((angle * Math.PI) / 180) * radius;
      const y2 = Math.sin((angle * Math.PI) / 180) * radius;

      g.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "rgba(255, 255, 255, 0.1)")
        .attr("stroke-width", 1);
        
      g.append("text")
        .attr("x", Math.cos(((angle + 15) * Math.PI) / 180) * (radius * 1.05))
        .attr("y", Math.sin(((angle + 15) * Math.PI) / 180) * (radius * 1.05))
        .attr("fill", "rgba(255, 255, 255, 0.4)")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .text(i + 1);
    }

    // Plot planets
    const colors: Record<string, string> = {
      Sun: "#fde047",
      Moon: "#f8fafc",
      Mercury: "#fb923c",
      Venus: "#f472b6",
      Mars: "#ef4444",
      Jupiter: "#a855f7",
      Saturn: "#94a3b8",
      Uranus: "#22d3ee",
      Neptune: "#6366f1",
      Pluto: "#475569"
    };

    data.planets.forEach((p, idx) => {
      // Calculate angle based on degree and sign position
      const signIndex = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].indexOf(p.sign);
      const angle = (signIndex * 30 + p.degree) * (Math.PI / 180);
      
      const r = radius * (0.85 - (idx % 3) * 0.1); // Stagger for visibility
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      g.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 4)
        .attr("fill", colors[p.planet] || "#fff")
        .attr("filter", "drop-shadow(0 0 4px rgba(255,255,255,0.5))");

      g.append("text")
        .attr("x", x)
        .attr("y", y - 8)
        .attr("fill", "white")
        .attr("font-size", "8px")
        .attr("text-anchor", "middle")
        .text(p.planet.substring(0, 2).toUpperCase());
    });

  }, [data]);

  return (
    <div className="flex justify-center items-center bg-slate-900/40 rounded-full p-4 glass aspect-square">
      <svg ref={svgRef} width="400" height="400" viewBox="0 0 400 400"></svg>
    </div>
  );
};

export default BirthChart;
