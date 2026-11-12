import { useState, useMemo } from "react";
import { AndroidDevice } from "@/types/device";
import { getDeviceImageCandidates } from "@/lib/deviceImageUtils";
import {
  DeviceMobile,
  DeviceTablet,
  Television,
  Car,
  Laptop,
  Watch,
  GameController,
  Question,
} from "@phosphor-icons/react";

interface DeviceImageProps {
  device: AndroidDevice;
  className?: string;
  imgClassName?: string;
  fallbackIconClassName?: string;
  fallbackIconStyle?: React.CSSProperties;
  fallbackIconContainerClassName?: string;
  fallbackIconContainerStyle?: React.CSSProperties;
  alt?: string;
  showIconFallback?: boolean;
}

export function DeviceImage({
  device,
  className = "",
  imgClassName = "w-full h-full object-contain",
  fallbackIconClassName = "h-8 w-8 text-white",
  fallbackIconStyle,
  fallbackIconContainerClassName = "",
  fallbackIconContainerStyle,
  alt,
  showIconFallback = true,
}: DeviceImageProps) {
  const candidateUrls = useMemo(() => getDeviceImageCandidates(device), [device]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const currentUrl = candidateUrls[candidateIndex];

  const handleImageError = () => {
    if (candidateIndex + 1 < candidateUrls.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const getFormFactorIcon = (formFactor: string) => {
    switch (formFactor.toLowerCase()) {
      case "phone":
        return <DeviceMobile className={fallbackIconClassName} style={fallbackIconStyle} />;
      case "tablet":
        return <DeviceTablet className={fallbackIconClassName} style={fallbackIconStyle} />;
      case "tv":
        return <Television className={fallbackIconClassName} style={fallbackIconStyle} />;
      case "android automotive":
        return <Car className={fallbackIconClassName} style={fallbackIconStyle} />;
      case "chromebook":
      case "desktop":
        return <Laptop className={fallbackIconClassName} style={fallbackIconStyle} />;
      case "wearable":
        return <Watch className={fallbackIconClassName} style={fallbackIconStyle} />;
      case "google play games on pc":
        return <GameController className={fallbackIconClassName} style={fallbackIconStyle} />;
      case "unknown":
        return <Question className={fallbackIconClassName} style={fallbackIconStyle} />;
      default:
        return <DeviceMobile className={fallbackIconClassName} style={fallbackIconStyle} />;
    }
  };

  if (hasError || !currentUrl) {
    if (!showIconFallback) return null;
    return (
      <div
        className={`flex items-center justify-center ${fallbackIconContainerClassName}`}
        style={fallbackIconContainerStyle}
      >
        {getFormFactorIcon(device.formFactor)}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Show icon placeholder until the real image finishes loading */}
      {!isLoaded && showIconFallback && (
        <div
          className={`flex items-center justify-center ${fallbackIconContainerClassName}`}
          style={fallbackIconContainerStyle}
        >
          {getFormFactorIcon(device.formFactor)}
        </div>
      )}

      <img
        src={currentUrl}
        alt={alt || `${device.manufacturer} ${device.modelName}`}
        className={`${imgClassName} ${isLoaded ? "opacity-100" : "opacity-0 absolute inset-0"} transition-opacity duration-200`}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={handleImageError}
      />
    </div>
  );
}
