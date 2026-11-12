import { AndroidDevice } from "@/types/device";

const BASE_IMAGE_URL = "https://android-device.gohk.xyz/images";

/**
 * Sanitizes a string for use in device image filenames.
 * Matches: safe_model = str(model_name).replace('/', '_').replace('\\', '_').replace(':', '_').replace('?', '_').replace(' ', '_')
 */
export function sanitizeFilenamePart(part: string | undefined | null): string {
  if (!part) return "";
  return String(part)
    .replace(/\//g, "_")
    .replace(/\\/g, "_")
    .replace(/:/g, "_")
    .replace(/\?/g, "_")
    .replace(/ /g, "_");
}

/**
 * Generates the primary device image URL using the standard format:
 * `https://android-device.gohk.xyz/images/{brand}_{device}.png`
 */
export function getDeviceImageUrl(device: AndroidDevice): string {
  const brand = sanitizeFilenamePart(device.brand || device.manufacturer);
  const deviceCode = sanitizeFilenamePart(device.device);
  return `${BASE_IMAGE_URL}/${brand}_${deviceCode}.png`;
}

/**
 * Fallback candidate URLs in case brand/manufacturer casing or model naming varies.
 */
export function getDeviceImageCandidates(device: AndroidDevice): string[] {
  const candidates = new Set<string>();
  
  const devCode = sanitizeFilenamePart(device.device);
  const modelName = sanitizeFilenamePart(device.modelName);
  
  const prefixes = [
    sanitizeFilenamePart(device.brand),
    sanitizeFilenamePart(device.brand?.toLowerCase()),
    sanitizeFilenamePart(device.manufacturer),
    sanitizeFilenamePart(device.manufacturer?.toLowerCase()),
  ].filter(Boolean);

  for (const prefix of prefixes) {
    if (devCode) {
      candidates.add(`${BASE_IMAGE_URL}/${prefix}_${devCode}.png`);
    }
    if (modelName && modelName !== devCode) {
      candidates.add(`${BASE_IMAGE_URL}/${prefix}_${modelName}.png`);
    }
  }

  return Array.from(candidates);
}
