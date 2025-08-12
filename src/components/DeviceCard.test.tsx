import { render, screen, fireEvent } from "@testing-library/react";
import { DeviceCard } from "./DeviceCard";
import { useComparison } from "@/contexts/ComparisonContext";
import { AndroidDevice } from "@/types/device";
import { vi, Mock } from 'vitest';
import * as deviceUtils from "@/lib/deviceUtils";

// Mock the deviceUtils module
vi.mock("@/lib/deviceUtils", async () => {
    const actual = await vi.importActual("@/lib/deviceUtils") as typeof deviceUtils;
    return {
        ...actual,
        formatRam: vi.fn((ram: string) => {
            if (ram === '8GB') return '8 GB';
            return actual.formatRam(ram);
        }),
    };
});

// Mock the useComparison hook
vi.mock("@/contexts/ComparisonContext", () => ({
  useComparison: vi.fn(),
}));

const mockDevice: AndroidDevice = {
  brand: "Google",
  device: "Pixel 8",
  modelName: "Pixel 8",
  manufacturer: "Google",
  ram: "8GB",
  formFactor: "Phone",
  processorName: "Tensor G3",
  gpu: "Mali-G715",
  screenSizes: ["6.2"],
  screenDensities: ["428"],
  abis: ["arm64-v8a", "armeabi-v7a"],
  sdkVersions: ["34"],
  openGLVersions: ["3.2"],
  vulkanVersions: ["1.3"],
  model: "Pixel 8",
  releaseDate: "2023-10-04"
};

describe("DeviceCard", () => {
  let addToComparison: Mock;
  let removeFromComparison: Mock;
  let isInComparison: Mock;
  let canAddToComparison: boolean;
  let onClick: Mock;
  let onShowJson: Mock;

  beforeEach(() => {
    addToComparison = vi.fn();
    removeFromComparison = vi.fn();
    isInComparison = vi.fn().mockReturnValue(false);
    canAddToComparison = true;
    onClick = vi.fn();
    onShowJson = vi.fn();

    (useComparison as Mock).mockReturnValue({
      addToComparison,
      removeFromComparison,
      isInComparison,
      canAddToComparison,
    });
  });

  it("should render device information correctly", () => {
    render(
      <DeviceCard
        device={mockDevice}
        onClick={onClick}
        onShowJson={onShowJson}
      />
    );

    expect(screen.getByText("Pixel 8")).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("8 GB")).toBeInTheDocument();
    expect(screen.getByText("API 34")).toBeInTheDocument();
    expect(screen.getByText("Tensor G3")).toBeInTheDocument();
    expect(screen.getByText("6.2")).toBeInTheDocument();
    expect(screen.getByText("arm64-v8a")).toBeInTheDocument();
    expect(screen.getByText("armeabi-v7a")).toBeInTheDocument();
  });

  it("should call onClick when the card is clicked", () => {
    render(
      <DeviceCard
        device={mockDevice}
        onClick={onClick}
        onShowJson={onShowJson}
      />
    );

    fireEvent.click(screen.getByText("Pixel 8"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should call onShowJson when the JSON button is clicked", () => {
    render(
      <DeviceCard
        device={mockDevice}
        onClick={onClick}
        onShowJson={onShowJson}
      />
    );

    fireEvent.click(screen.getByTitle("View source JSON"));
    expect(onShowJson).toHaveBeenCalledTimes(1);
  });

  it("should call addToComparison when the add button is clicked", () => {
    render(
      <DeviceCard
        device={mockDevice}
        onClick={onClick}
        onShowJson={onShowJson}
      />
    );

    fireEvent.click(screen.getByTitle("Add to comparison"));
    expect(addToComparison).toHaveBeenCalledWith(mockDevice);
  });

  it("should call removeFromComparison when the remove button is clicked", () => {
    isInComparison.mockReturnValue(true);
    render(
      <DeviceCard
        device={mockDevice}
        onClick={onClick}
        onShowJson={onShowJson}
      />
    );

    fireEvent.click(screen.getByTitle("Remove from comparison"));
    expect(removeFromComparison).toHaveBeenCalledWith("Google-Pixel 8");
  });

  it("should disable the add button when canAddToComparison is false", () => {
    canAddToComparison = false;
    (useComparison as Mock).mockReturnValue({
        addToComparison,
        removeFromComparison,
        isInComparison,
        canAddToComparison,
    });
    render(
      <DeviceCard
        device={mockDevice}
        onClick={onClick}
        onShowJson={onShowJson}
      />
    );

    expect(screen.getByTitle("Add to comparison")).toBeDisabled();
  });
});
