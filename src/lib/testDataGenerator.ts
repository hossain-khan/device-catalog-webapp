import { AndroidDevice } from '@/types/device';

const manufacturers = [
  'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Sony', 'LG', 'Motorola', 
  'Nokia', 'Oppo', 'Vivo', 'Realme', 'Honor', 'Nothing', 'Fairphone', 'Essential',
  'HTC', 'Asus', 'TCL', 'ZTE', 'Alcatel', 'Blackberry', 'CAT', 'Doogee',
  'Ulefone', 'Umidigi', 'Oukitel', 'Blackview', 'Cubot', 'Elephone'
];

const brands = [
  'samsung', 'google', 'OnePlus', 'xiaomi', 'HUAWEI', 'sony', 'lge', 'motorola',
  'HMD Global', 'OPPO', 'vivo', 'realme', 'HONOR', 'nothing', 'Fairphone', 'Essential',
  'htc', 'asus', 'TCL', 'ZTE', 'alcatel', 'BlackBerry', 'Caterpillar', 'DOOGEE',
  'Ulefone', 'UMIDIGI', 'OUKITEL', 'Blackview', 'CUBOT', 'ELEPHONE'
];

const formFactors = [
  'Phone', 'Tablet', 'TV', 'Android Automotive', 'Chromebook', 'Wearable', 'Google Play Games on PC'
];

const processors = [
  'Qualcomm SDM8550', 'Qualcomm MSM8998', 'Qualcomm SM8350', 'Qualcomm SM7125',
  'Qualcomm SDM450', 'Qualcomm SM8650', 'Qualcomm SM8550', 'Qualcomm SDM855',
  'Mediatek MT6572A', 'Mediatek MT8765A', 'Mediatek MT6769', 'Mediatek MT6833',
  'Spreadtrum SC9832A', 'Spreadtrum SC7731E', 'Spreadtrum SC9863A',
  'Samsung Exynos 2100', 'Samsung Exynos 990', 'Samsung Exynos 1080',
  'Unisoc Tiger T606', 'Unisoc Tiger T618', 'Rockchip RK3326', 'Realtek RTD2851A'
];

const gpus = [
  'Qualcomm Adreno 740 (818 MHz)', 'Qualcomm Adreno 640 (585 MHz)', 
  'Qualcomm Adreno 660 (840 MHz)', 'Qualcomm Adreno 618 (750 MHz)',
  'Qualcomm Adreno 506 (600 MHz)', 'Qualcomm Adreno 750 (903 MHz)',
  'ARM Mali G78 (800 MHz)', 'ARM Mali G77 (700 MHz)', 'ARM Mali G76 (650 MHz)',
  'ARM Mali 400 (614 MHz)', 'ARM Mali T820 (600 MHz)', 'ARM Mali G31 (700 MHz)',
  'Imagination Tech PowerVR GE8322 (550 MHz)', 'Imagination Tech PowerVR GE8100 (570 MHz)',
  'Samsung Xclipse 920', 'Samsung Xclipse 940'
];

const screenSizes = [
  ['1080x1920'], ['1440x2880'], ['1440x3040'], ['1200x2664'], ['1080x2400'],
  ['720x1280'], ['1080x2340'], ['1440x3120'], ['480x800'], ['600x1024'],
  ['800x1280'], ['480x854'], ['1024x600'], ['1366x768'], ['720x1520'],
  ['1080x2248'], ['900x1920'], ['1080x2664'], ['2160x3840'], ['1200x1920']
];

const densities = [160, 200, 240, 280, 320, 420, 450, 480, 520, 560, 640];

const abis = [
  ['arm64-v8a', 'armeabi', 'armeabi-v7a'],
  ['arm64-v8a'],
  ['armeabi', 'armeabi-v7a'],
  ['arm64-v8a', 'armeabi-v7a'],
  ['x86', 'x86_64']
];

const sdkVersions = [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];
const openGlVersions = ['2.0', '3.0', '3.1', '3.2'];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], min = 1, max = 3): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateDeviceId(manufacturer: string, index: number): string {
  const prefixes = ['SM-', 'GT-', 'Pixel', 'OP', 'MI', 'P', 'G', 'M', 'N', 'A'];
  const prefix = getRandomItem(prefixes);
  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${suffix}${index}`;
}

function generateModelName(manufacturer: string, index: number): string {
  const phoneNames = [
    'Galaxy S', 'Galaxy Note', 'Galaxy A', 'Pixel', 'OnePlus', 'Mi', 'Redmi',
    'P Series', 'Mate', 'Nova', 'Xperia', 'V Series', 'G Series', 'Edge',
    'Moto G', 'Find X', 'Reno', 'Nord', 'Nothing Phone', 'Phone'
  ];
  
  const baseName = getRandomItem(phoneNames);
  const version = Math.floor(Math.random() * 50) + 1;
  const variant = Math.random() > 0.7 ? getRandomItem(['Pro', 'Ultra', 'Plus', 'Lite', 'SE']) : '';
  
  return `${baseName} ${version}${variant ? ' ' + variant : ''}`;
}

function generateRam(): string {
  const ramValues = [
    '512MB', '1GB', '1.5GB', '2GB', '3GB', '4GB', '6GB', '8GB', 
    '12GB', '16GB', '18GB', '24GB', '472MB', '934MB', '1426MB',
    '1992MB', '3675MB', '3742MB', '5730MB', '7399MB', '11629MB'
  ];
  return getRandomItem(ramValues);
}

export function generateTestDevices(count: number): AndroidDevice[] {
  const devices: AndroidDevice[] = [];
  
  for (let i = 0; i < count; i++) {
    const manufacturerIndex = Math.floor(Math.random() * manufacturers.length);
    const manufacturer = manufacturers[manufacturerIndex];
    const brand = brands[manufacturerIndex];
    
    const device: AndroidDevice = {
      brand: brand,
      device: generateDeviceId(manufacturer, i),
      manufacturer: manufacturer,
      modelName: generateModelName(manufacturer, i),
      ram: generateRam(),
      formFactor: getRandomItem(formFactors),
      processorName: getRandomItem(processors),
      gpu: getRandomItem(gpus),
      screenSizes: getRandomItem(screenSizes),
      screenDensities: getRandomItems(densities, 1, 2),
      abis: getRandomItem(abis),
      sdkVersions: getRandomItems(sdkVersions, 1, 4),
      openGlEsVersions: getRandomItems(openGlVersions, 1, 2)
    };
    
    devices.push(device);
  }
  
  return devices;
}

export function downloadDevicesAsJson(devices: AndroidDevice[], filename = 'android-devices.json') {
  const dataStr = JSON.stringify(devices, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}