import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

interface D3HorizontalBarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  onBarClick?: (data: { label: string; value: number }) => void;
  className?: string;
}

export const D3HorizontalBarChart = ({
  data,
  width = 800,
  height = 400,
  margin = { top: 20, right: 40, bottom: 40, left: 120 },
  onBarClick,
  className = ""
}: D3HorizontalBarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Get container dimensions for responsiveness
    const containerWidth = containerRef.current.clientWidth;
    const actualWidth = Math.min(width, containerWidth);
    const actualHeight = height;

    const innerWidth = actualWidth - margin.left - margin.right;
    const innerHeight = actualHeight - margin.top - margin.bottom;

    // Update SVG dimensions
    svg.attr("width", actualWidth).attr("height", actualHeight);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d.value) || 0])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(sortedData.map(d => d.label))
      .range([0, innerHeight])
      .padding(0.1);

    // Create main group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create gradient definitions for better visual appeal
    const defs = svg.append("defs");
    sortedData.forEach((d, i) => {
      const gradient = defs.append("linearGradient")
        .attr("id", `gradient-${i}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", xScale(d.value)).attr("y2", 0);

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d.color || "#3b82f6")
        .attr("stop-opacity", 0.8);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d.color || "#3b82f6")
        .attr("stop-opacity", 0.6);
    });

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000");

    // Create bars
    const bars = g.selectAll(".bar")
      .data(sortedData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => yScale(d.label) || 0)
      .attr("height", yScale.bandwidth())
      .attr("fill", (d, i) => `url(#gradient-${i})`)
      .attr("stroke", d => d.color || "#3b82f6")
      .attr("stroke-width", 1)
      .style("cursor", onBarClick ? "pointer" : "default")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke-width", 2)
          .attr("opacity", 0.8);
        
        tooltip
          .style("visibility", "visible")
          .html(`<strong>${d.label}</strong><br/>${d.value.toLocaleString()} devices`);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke-width", 1)
          .attr("opacity", 1);
        
        tooltip.style("visibility", "hidden");
      })
      .on("click", function(event, d) {
        if (onBarClick) {
          onBarClick({ label: d.label, value: d.value });
        }
      });

    // Animate bars
    bars
      .attr("width", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr("width", d => xScale(d.value));

    // Add value labels on bars
    g.selectAll(".value-label")
      .data(sortedData)
      .enter().append("text")
      .attr("class", "value-label")
      .attr("x", d => xScale(d.value) + 5)
      .attr("y", d => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .style("fill", "var(--foreground)")
      .style("font-weight", "500")
      .text(d => d.value.toLocaleString())
      .style("opacity", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50 + 400)
      .style("opacity", 1);

    // Add Y axis (labels)
    const yAxis = d3.axisLeft(yScale)
      .tickSize(0);

    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", "var(--foreground)")
      .style("font-weight", "500");

    // Style the axis
    g.select(".y-axis")
      .select(".domain")
      .remove();

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => d3.format(".0s")(d as number));

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "var(--muted-foreground)");

    // Style the x axis
    g.select(".x-axis")
      .select(".domain")
      .style("stroke", "var(--border)");

    g.select(".x-axis")
      .selectAll(".tick line")
      .style("stroke", "var(--border)");

    // Cleanup function
    return () => {
      tooltip.remove();
    };
  }, [sortedData, width, height, margin, onBarClick]);

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <svg ref={svgRef} className="w-full" style={{ height: height }} />
    </div>
  );
};