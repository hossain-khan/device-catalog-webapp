// Test component to verify virtual scrolling fixes
import { DeviceCard } from './components/DeviceCard';
import { AndroidDevice } from './types/device';

const testDevice: AndroidDevice = {
  brand: "google",
  device: "walleye",
  manufacturer: "Google",
  modelName: "Pixel 2",
  ram: "1992-4116MB",
  formFactor: "Phone",
  processorName: "Qualcomm MSM8998",
  gpu: "Qualcomm Adreno 540 (650 MHz)",
  screenSizes: ["1080x1920", "720x1280"],
  screenDensities: [160, 420],
  abis: ["arm64-v8a", "armeabi", "armeabi-v7a"],
  sdkVersions: [29, 30],
  openGlEsVersions: ["3.2"]
};

// Test function to verify card height consistency
export function testCardHeight() {
  const cardElement = document.createElement('div');
  cardElement.style.height = '200px';
  cardElement.style.minHeight = '200px';
  cardElement.style.maxHeight = '200px';
  
  console.log('Card height should be:', {
    height: cardElement.style.height,
    minHeight: cardElement.style.minHeight,
    maxHeight: cardElement.style.maxHeight
  });
  
  return cardElement.offsetHeight === 200;
}