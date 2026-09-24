/**
 * Lucide Vector Icon Component
 * Crisp, scalable vector icons powered by lucide-react-native.
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import {
  Fuel,
  Scan,
  History,
  User,
  Home,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle2,
  AlertCircle,
  Info,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Camera,
  Zap,
  ZapOff,
  X,
  LogOut,
  Bell,
  ShieldCheck,
  Car,
  Percent,
  SquarePen,
  Building2,
  Award,
  LucideIcon,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';

export type IconName =
  | 'fuel'
  | 'qr-scan'
  | 'history'
  | 'user'
  | 'home'
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-right'
  | 'chevron-down'
  | 'check'
  | 'check-circle'
  | 'alert-circle'
  | 'info'
  | 'lock'
  | 'mail'
  | 'phone'
  | 'eye'
  | 'eye-off'
  | 'refresh'
  | 'filter'
  | 'search'
  | 'calendar'
  | 'camera'
  | 'flash-on'
  | 'flash-off'
  | 'close'
  | 'logout'
  | 'bell'
  | 'shield-check'
  | 'car'
  | 'percent'
  | 'edit'
  | 'building'
  | 'badge';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

const ICON_MAP: Record<IconName, LucideIcon> = {
  fuel: Fuel,
  'qr-scan': Scan,
  history: History,
  user: User,
  home: Home,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  check: Check,
  'check-circle': CheckCircle2,
  'alert-circle': AlertCircle,
  info: Info,
  lock: Lock,
  mail: Mail,
  phone: Phone,
  eye: Eye,
  'eye-off': EyeOff,
  refresh: RefreshCw,
  filter: Filter,
  search: Search,
  calendar: Calendar,
  camera: Camera,
  'flash-on': Zap,
  'flash-off': ZapOff,
  close: X,
  logout: LogOut,
  bell: Bell,
  'shield-check': ShieldCheck,
  car: Car,
  percent: Percent,
  edit: SquarePen,
  building: Building2,
  badge: Award,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 22,
  color = colors.textPrimary,
  strokeWidth = 2,
  style,
}) => {
  const LucideComponent = ICON_MAP[name] || Info;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <LucideComponent
        size={size}
        color={color}
        strokeWidth={strokeWidth}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Icon;
