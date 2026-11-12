import { describe, it, expect } from "vitest";
import { sanitizeFilenamePart, getDeviceImageUrl, getDeviceImageCandidates } from "./deviceImageUtils";
import { AndroidDevice } from "@/types/device";

describe("deviceImageUtils", () => {
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

  it("sanitizes filename parts by replacing special characters with underscores", () => {
    expect(sanitizeFilenamePart("foo/bar\\baz:qux?test demo")).toBe("foo_bar_baz_qux_test_demo");
  });

  it("builds the standard device image URL", () => {
    expect(getDeviceImageUrl(mockDevice)).toBe(
      "https://cdn.android-device.gohk.xyz/images/samsung_herolte.png"
    );
  });

  it("provides fallback candidates for image resolution", () => {
    const candidates = getDeviceImageCandidates(mockDevice);
    expect(candidates).toContain("https://cdn.android-device.gohk.xyz/images/samsung_herolte.png");
    expect(candidates).toContain("https://cdn.android-device.gohk.xyz/images/Samsung_herolte.png");
    expect(candidates).toContain("https://cdn.android-device.gohk.xyz/images/samsung_Galaxy_S7.png");
  });
});
