import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

interface D3DonutChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  onSegmentClick?: (data: { label: string; value: number }) => void;
  className?: string;
  showLabels?: boolean;
  showLegend?: boolean;
}

export const D3DonutChart = ({
  data,
  width = 400,
  height = 400,
  innerRadius,
  outerRadius,
  onSegmentClick,
  className = "",
  showLabels = true,
  showLegend = true
}: D3DonutChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const processedData = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    return data.map((d, i) => ({
      ...d,
      percentage: ((d.value / total) * 100).toFixed(1),
      color: d.color || d3.schemeCategory10[i % 10]
    }));
  }, [data]);

  const radius = useMemo(() => Math.min(width, height) / 2 - 20, [width, height]);
  const actualInnerRadius = innerRadius || radius * 0.5;
  const actualOuterRadius = outerRadius || radius * 0.8;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const actualWidth = Math.min(width, containerWidth);
    const actualHeight = height;

    svg.attr("width", actualWidth).attr("height", actualHeight);

    // Create main group and center it
    const g = svg.append("g")
      .attr("transform", `translate(${actualWidth / 2},${actualHeight / 2})`);

    // Create pie generator
    const pie = d3.pie<any>()
      .value(d => d.value)
      .sort(null);

    // Create arc generator
    const arc = d3.arc<any>()
      .innerRadius(actualInnerRadius)
      .outerRadius(actualOuterRadius);

    // Create arc for labels
    const labelArc = d3.arc<any>()
      .innerRadius(actualOuterRadius + 10)
      .outerRadius(actualOuterRadius + 10);

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-donut-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000");

    // Create arcs
    const arcs = g.selectAll(".arc")
      .data(pie(processedData))
      .enter().append("g")
      .attr("class", "arc");

    // Add paths (segments)
    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => d.data.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", onSegmentClick ? "pointer" : "default")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", d3.arc<any>()
            .innerRadius(actualInnerRadius)
            .outerRadius(actualOuterRadius + 10)
          );
        
        tooltip
          .style("visibility", "visible")
          .html(`<strong>${d.data.label}</strong><br/>${d.data.value.toLocaleString()} devices (${d.data.percentage}%)`);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc);
        
        tooltip.style("visibility", "hidden");
      })
      .on("click", function(event, d) {
        if (onSegmentClick) {
          onSegmentClick({ label: d.data.label, value: d.data.value });
        }
      });

    // Animate the arcs
    arcs.selectAll("path")
      .transition()
      .duration(1000)
      .attrTween("d", function(d: any) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function(t) {
          return arc(interpolate(t));
        };
      });

    // Add labels if enabled
    if (showLabels) {
      arcs.append("text")
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-weight", "500")
        .style("fill", "var(--foreground)")
        .text(d => d.data.percentage >= 5 ? `${d.data.percentage}%` : '') // Only show labels for segments >= 5%
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .delay(500)
        .style("opacity", 1);
    }

    // Add center text with total
    const total = processedData.reduce((sum, d) => sum + d.value, 0);
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("fill", "var(--foreground)")
      .text(total.toLocaleString())
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .delay(800)
      .style("opacity", 1);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .style("font-size", "12px")
      .style("fill", "var(--muted-foreground)")
      .text("Total Devices")
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .delay(1000)
      .style("opacity", 1);

    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [processedData, width, height, actualInnerRadius, actualOuterRadius, onSegmentClick, showLabels]);

  return (
    <div ref={containerRef} className={`flex flex-col items-center ${className}`}>
      <svg ref={svgRef} className="flex-shrink-0" style={{ width: width, height: height }} />
      
      {showLegend && (
        <div className="mt-4 grid grid-cols-2 gap-2 max-w-sm">
          {processedData.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate font-medium">{item.label}</span>
              <span className="text-muted-foreground ml-auto">{item.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};