import { Cloud, CloudRain, CloudSnow, CloudDrizzle, Sun, CloudFog, Wind } from 'lucide-react-native';
import { colors } from '../constants/theme';

interface WeatherIconProps {
  conditions: string;
  size?: number;
  color?: string;
}

export function WeatherIcon({ conditions, size = 48, color = colors.primary }: WeatherIconProps) {
  const normalizedConditions = conditions.toLowerCase();

  if (normalizedConditions.includes('rain')) {
    return <CloudRain size={size} color={color} />;
  }

  if (normalizedConditions.includes('drizzle')) {
    return <CloudDrizzle size={size} color={color} />;
  }

  if (normalizedConditions.includes('snow')) {
    return <CloudSnow size={size} color={color} />;
  }

  if (normalizedConditions.includes('cloud')) {
    return <Cloud size={size} color={color} />;
  }

  if (normalizedConditions.includes('clear')) {
    return <Sun size={size} color={color} />;
  }

  if (normalizedConditions.includes('fog') || normalizedConditions.includes('mist') || normalizedConditions.includes('haze')) {
    return <CloudFog size={size} color={color} />;
  }

  if (normalizedConditions.includes('wind')) {
    return <Wind size={size} color={color} />;
  }

  return <Cloud size={size} color={color} />;
}
