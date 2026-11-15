import { useState, useMemo } from "react";
import { AndroidDevice } from "@/types/device";
import { formatRam } from "@/lib/deviceUtils";
import { getDeviceColors, parseRamMB, ColorMode } from "@/lib/deviceColors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/contexts/ComparisonContext";
import { DeviceImage } from "./DeviceImage";
import {
  Plus,
  Check,
  Code,
  CaretUp,
  CaretDown,
  CaretUpDown,
} from "@phosphor-icons/react";

interface DeviceTableViewProps {
  devices: AndroidDevice[];
  onDeviceClick: (device: AndroidDevice) => void;
  onShowJson: (device: AndroidDevice) => void;
  colorMode?: ColorMode;
}

type SortColumn = "modelName" | "manufacturer" | "formFactor" | "ram" | "sdk" | "processor";
type SortDirection = "ascending" | "descending";

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

export const DeviceTableView = ({
  devices,
  onDeviceClick,
  onShowJson,
  colorMode = "formFactor",
}: DeviceTableViewProps) => {
  const { addToComparison, removeFromComparison, isInComparison, canAddToComparison } =
    useComparison();

  const [sortCol, setSortCol] = useState<SortColumn | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("ascending");
  const [sortAnnouncement, setSortAnnouncement] = useState("");

  const handleSort = (column: SortColumn, label: string) => {
    let nextDir: SortDirection = "ascending";
    if (sortCol === column) {
      nextDir = sortDir === "ascending" ? "descending" : "ascending";
    }
    setSortCol(column);
    setSortDir(nextDir);
    setSortAnnouncement(`Sorted by ${label}, ${nextDir}, ${devices.length} rows`);
  };

  const sortedDevices = useMemo(() => {
    if (!sortCol) return devices;
    const factor = sortDir === "ascending" ? 1 : -1;

    return [...devices].sort((a, b) => {
      switch (sortCol) {
        case "ram":
          return factor * (parseRamMB(a.ram) - parseRamMB(b.ram));
        case "sdk": {
          const maxA = Math.max(...a.sdkVersions, 0);
          const maxB = Math.max(...b.sdkVersions, 0);
          return factor * (maxA - maxB);
        }
        case "modelName":
          return factor * collator.compare(a.modelName || "", b.modelName || "");
        case "manufacturer":
          return factor * collator.compare(a.manufacturer || "", b.manufacturer || "");
        case "formFactor":
          return factor * collator.compare(a.formFactor || "", b.formFactor || "");
        case "processor":
          return factor * collator.compare(a.processorName || "", b.processorName || "");
        default:
          return 0;
      }
    });
  }, [devices, sortCol, sortDir]);

  const renderSortIcon = (column: SortColumn) => {
    if (sortCol !== column) {
      return <CaretUpDown aria-hidden="true" className="h-3.5 w-3.5 opacity-45 shrink-0" />;
    }
    return sortDir === "ascending" ? (
      <CaretUp aria-hidden="true" className="h-3.5 w-3.5 text-primary shrink-0" />
    ) : (
      <CaretDown aria-hidden="true" className="h-3.5 w-3.5 text-primary shrink-0" />
    );
  };

  return (
    <div className="relative">
      <div role="status" className="sr-status">
        {sortAnnouncement}
      </div>

      <div
        tabIndex={0}
        role="region"
        aria-labelledby="device-catalog-table-caption"
        className="overflow-x-auto rounded-xl border border-border/80 bg-card shadow-xs focus-visible:outline-2 focus-visible:outline-ring"
      >
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <caption id="device-catalog-table-caption" className="sr-only">
            Android Device Catalog Specifications
          </caption>
          <thead className="sticky top-0 z-10 bg-muted/70 backdrop-blur-sm border-b border-border/80 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th
                scope="col"
                aria-sort={sortCol === "modelName" ? sortDir : undefined}
                className="p-0 font-semibold"
              >
                <button
                  type="button"
                  onClick={() => handleSort("modelName", "Device Model")}
                  className="flex w-full items-center gap-1.5 px-4 py-3 text-left font-semibold hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span>Device / Model</span>
                  {renderSortIcon("modelName")}
                </button>
              </th>
              <th
                scope="col"
                aria-sort={sortCol === "manufacturer" ? sortDir : undefined}
                className="p-0 font-semibold"
              >
                <button
                  type="button"
                  onClick={() => handleSort("manufacturer", "Manufacturer")}
                  className="flex w-full items-center gap-1.5 px-3 py-3 text-left font-semibold hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span>Manufacturer</span>
                  {renderSortIcon("manufacturer")}
                </button>
              </th>
              <th
                scope="col"
                aria-sort={sortCol === "formFactor" ? sortDir : undefined}
                className="p-0 font-semibold"
              >
                <button
                  type="button"
                  onClick={() => handleSort("formFactor", "Form Factor")}
                  className="flex w-full items-center gap-1.5 px-3 py-3 text-left font-semibold hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span>Form Factor</span>
                  {renderSortIcon("formFactor")}
                </button>
              </th>
              <th
                scope="col"
                aria-sort={sortCol === "ram" ? sortDir : undefined}
                className="p-0 font-semibold"
              >
                <button
                  type="button"
                  onClick={() => handleSort("ram", "RAM")}
                  className="flex w-full items-center gap-1.5 px-3 py-3 text-left font-semibold hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span>RAM</span>
                  {renderSortIcon("ram")}
                </button>
              </th>
              <th
                scope="col"
                aria-sort={sortCol === "sdk" ? sortDir : undefined}
                className="p-0 font-semibold"
              >
                <button
                  type="button"
                  onClick={() => handleSort("sdk", "SDK API")}
                  className="flex w-full items-center gap-1.5 px-3 py-3 text-left font-semibold hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span>SDK / API</span>
                  {renderSortIcon("sdk")}
                </button>
              </th>
              <th
                scope="col"
                aria-sort={sortCol === "processor" ? sortDir : undefined}
                className="p-0 font-semibold"
              >
                <button
                  type="button"
                  onClick={() => handleSort("processor", "Processor")}
                  className="flex w-full items-center gap-1.5 px-3 py-3 text-left font-semibold hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span>SoC / GPU</span>
                  {renderSortIcon("processor")}
                </button>
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Display
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                ABIs
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {sortedDevices.map((device, idx) => {
              const deviceId = `${device.brand}-${device.device}`;
              const inComparison = isInComparison(deviceId);
              const colors = getDeviceColors(device, colorMode);
              const sdkLabel =
                device.sdkVersions.length === 1
                  ? `API ${device.sdkVersions[0]}`
                  : `API ${Math.min(...device.sdkVersions)}–${Math.max(...device.sdkVersions)}`;

              return (
                <tr
                  key={`${device.device}-${idx}`}
                  onClick={() => onDeviceClick(device)}
                  className={`group cursor-pointer transition-colors hover:bg-muted/50 ${
                    inComparison ? "bg-primary/5" : ""
                  }`}
                >
                  <th
                    scope="row"
                    className="px-4 py-2.5 font-normal text-foreground"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center p-1 border"
                        style={{
                          backgroundColor: colors.secondary,
                          borderColor: colors.border,
                        }}
                      >
                        <DeviceImage
                          device={device}
                          className="w-full h-full"
                          imgClassName="w-full h-full object-contain"
                          fallbackIconClassName="h-4 w-4 text-foreground/80"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[220px]">
                          {device.modelName}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground truncate max-w-[220px]">
                          {device.device}
                        </div>
                      </div>
                    </div>
                  </th>

                  <td className="px-3 py-2.5 text-sm font-medium text-foreground/90 whitespace-nowrap">
                    {device.manufacturer}
                  </td>

                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md border"
                      style={{
                        backgroundColor: colors.secondary,
                        borderColor: colors.border,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: colors.primary }}
                      />
                      {device.formFactor}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 font-semibold tabular-nums whitespace-nowrap">
                    {formatRam(device.ram)}
                  </td>

                  <td className="px-3 py-2.5 font-mono text-xs tabular-nums whitespace-nowrap">
                    <Badge variant="secondary" className="font-mono text-[11px] font-medium">
                      {sdkLabel}
                    </Badge>
                  </td>

                  <td className="px-3 py-2.5 max-w-[200px]">
                    <div className="text-xs font-medium text-foreground truncate" title={device.processorName}>
                      {device.processorName || "Not specified"}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate" title={device.gpu}>
                      {device.gpu || "—"}
                    </div>
                  </td>

                  <td className="px-3 py-2.5 whitespace-nowrap font-mono text-xs text-muted-foreground">
                    <div>{device.screenSizes[0] || "—"}</div>
                    {device.screenDensities[0] && (
                      <div className="text-[10px] opacity-80">{device.screenDensities[0]} dpi</div>
                    )}
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {device.abis.slice(0, 2).map((abi) => (
                        <Badge
                          key={abi}
                          variant="outline"
                          className="font-mono text-[10px] px-1.5 py-0 h-4.5 bg-background/60"
                        >
                          {abi}
                        </Badge>
                      ))}
                      {device.abis.length > 2 && (
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] px-1 py-0 h-4.5 bg-background/60"
                        >
                          +{device.abis.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>

                  <td
                    className="px-4 py-2.5 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center justify-end gap-1">
                      <Button
                        variant={inComparison ? "default" : "outline"}
                        size="sm"
                        className="h-7 w-7 p-0 rounded-md"
                        disabled={!inComparison && !canAddToComparison}
                        onClick={() => {
                          if (inComparison) {
                            removeFromComparison(deviceId);
                          } else {
                            addToComparison(device);
                          }
                        }}
                        title={inComparison ? "Remove from comparison" : "Add to comparison"}
                      >
                        {inComparison ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-md"
                        onClick={() => onShowJson(device)}
                        title="View source JSON"
                      >
                        <Code className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
