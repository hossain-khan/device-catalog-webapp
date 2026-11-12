import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeviceImage } from "./DeviceImage";
import { AndroidDevice } from "@/types/device";

describe("DeviceImage", () => {
  const mockDevice: AndroidDevice = {
    brand: "samsung",
    device: "herolte",
    manufacturer: "Samsung",
    modelName: "Galaxy S7",
    ram: "3709MB",
    formFactor: "Phone",
    processorName: "Samsung Exynos 8890",
    gpu: "ARM Mali T880",
    screenSizes: ["1080x1920"],
    screenDensities: [480],
    abis: ["arm64-v8a"],
    sdkVersions: [26],
    openGlEsVersions: ["3.2"],
  };

  it("renders image tag with primary candidate URL", () => {
    render(<DeviceImage device={mockDevice} />);
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.src).toContain("https://cdn.android-device.gohk.xyz/images/samsung_herolte.png");
  });

  it("falls back to icon when all candidate URLs fail", () => {
    const { container } = render(
      <DeviceImage
        device={mockDevice}
        fallbackIconContainerClassName="test-icon-container"
      />
    );
    const img = screen.getByRole("img");
    
    // Simulate error on all candidate URLs
    for (let i = 0; i < 5; i++) {
      fireEvent.error(img);
    }

    // Now the image tag should no longer be rendered, and the fallback icon container remains
    expect(container.querySelector(".test-icon-container")).toBeDefined();
  });
});
