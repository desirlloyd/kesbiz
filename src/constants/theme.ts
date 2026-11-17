import { Platform } from 'react-native';

export const LightColors = {
  ivory: '#F7F4EC',
  paper: '#FAF8F3',
  card: '#FFFFFF',
  border: '#E2DCD0',
  borderLight: '#EFEBE0',
  forest: '#174B3A',
  forestDark: '#103529',
  forestLight: '#1F5E49',
  green: '#16A36A',
  greenDark: '#118354',
  greenLight: '#E8F5EF',
  ink: '#242923',
  inkMuted: '#595F56',
  terracotta: '#C66A45',
  terracottaDark: '#A55230',
  terracottaLight: '#FAEDE8',
  sage: '#E5EDE4',
  sageLight: '#F1F6F0',
  sageDark: '#CBD9C9',
  warmGray: '#777970',
  warmGrayLight: '#A2A49B',
  sand: '#D9D3C5',
};

export const DarkColors = {
  ivory: '#0F1411',
  paper: '#151C18',
  card: '#1C2520',
  border: '#2A3730',
  borderLight: '#222C27',
  forest: '#267A5E',
  forestDark: '#174B3A',
  forestLight: '#1E654E',
  green: '#1ECB85',
  greenDark: '#16A36A',
  greenLight: '#162C22',
  ink: '#F5F2EB',
  inkMuted: '#A7B2A6',
  terracotta: '#E0764F',
  terracottaDark: '#C66A45',
  terracottaLight: '#2C1B15',
  sage: '#202D26',
  sageLight: '#18231D',
  sageDark: '#3A4D42',
  warmGray: '#8E968D',
  warmGrayLight: '#5E665D',
  sand: '#38463D',
};

export const Colors = {
  merchant: LightColors,
  moncash: {
    DEFAULT: '#E31837',
    light: '#FEECEC',
    dark: '#B00F26',
  },
  natcash: {
    DEFAULT: '#0085CA',
    light: '#E6F4FB',
    dark: '#005D8F',
  },
};

export const TouchTargets = {
  min: 44,
  minAndroid: 48,
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
  hitSlopSm: { top: 6, bottom: 6, left: 6, right: 6 },
};

export const Typography = {
  fontFamily: {
    sans: Platform.OS === 'ios' ? undefined : 'sans-serif',
    mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    hero: 28,
  },
};

export const Shadows = {
  card: {
    shadowColor: '#242923',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  ledger: {
    shadowColor: '#174B3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  floating: {
    shadowColor: '#103529',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
