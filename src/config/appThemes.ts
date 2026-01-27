/**
 * App Theme Palette Registry
 * Defines CSS custom property values for each app palette
 * 
 * @module config/appThemes
 * @feature 006-more-themes
 */

import type { AppPaletteId } from '@/types';

/**
 * CSS Custom Property values for a theme palette
 * Uses HSL format for shadcn/ui compatibility
 */
export interface PaletteColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  // Sidebar specific colors
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface AppPaletteConfig {
  id: AppPaletteId;
  name: string;
  description: string;
  light: PaletteColors;
  dark: PaletteColors;
}

/**
 * Caffeine - Default palette (warm amber tones)
 */
const caffeinePalette: AppPaletteConfig = {
  id: 'caffeine',
  name: 'Caffeine',
  description: 'Warm amber tones inspired by coffee',
  light: {
    background: '0 0% 100%',
    foreground: '20 14.3% 4.1%',
    card: '0 0% 100%',
    cardForeground: '20 14.3% 4.1%',
    popover: '0 0% 100%',
    popoverForeground: '20 14.3% 4.1%',
    primary: '24.6 95% 53.1%',
    primaryForeground: '60 9.1% 97.8%',
    secondary: '60 4.8% 95.9%',
    secondaryForeground: '24 9.8% 10%',
    muted: '60 4.8% 95.9%',
    mutedForeground: '25 5.3% 44.7%',
    accent: '60 4.8% 95.9%',
    accentForeground: '24 9.8% 10%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '60 9.1% 97.8%',
    border: '20 5.9% 90%',
    input: '20 5.9% 90%',
    ring: '24.6 95% 53.1%',
    sidebarBackground: '0 0% 98%',
    sidebarForeground: '240 5.3% 26.1%',
    sidebarPrimary: '24.6 95% 53.1%',
    sidebarPrimaryForeground: '0 0% 98%',
    sidebarAccent: '240 4.8% 95.9%',
    sidebarAccentForeground: '240 5.9% 10%',
    sidebarBorder: '220 13% 91%',
    sidebarRing: '24.6 95% 53.1%',
  },
  dark: {
    background: '20 14.3% 4.1%',
    foreground: '60 9.1% 97.8%',
    card: '20 14.3% 4.1%',
    cardForeground: '60 9.1% 97.8%',
    popover: '20 14.3% 4.1%',
    popoverForeground: '60 9.1% 97.8%',
    primary: '20.5 90.2% 48.2%',
    primaryForeground: '60 9.1% 97.8%',
    secondary: '12 6.5% 15.1%',
    secondaryForeground: '60 9.1% 97.8%',
    muted: '12 6.5% 15.1%',
    mutedForeground: '24 5.4% 63.9%',
    accent: '12 6.5% 15.1%',
    accentForeground: '60 9.1% 97.8%',
    destructive: '0 72.2% 50.6%',
    destructiveForeground: '60 9.1% 97.8%',
    border: '12 6.5% 15.1%',
    input: '12 6.5% 15.1%',
    ring: '20.5 90.2% 48.2%',
    sidebarBackground: '240 5.9% 10%',
    sidebarForeground: '240 4.8% 95.9%',
    sidebarPrimary: '20.5 90.2% 48.2%',
    sidebarPrimaryForeground: '0 0% 100%',
    sidebarAccent: '240 3.7% 15.9%',
    sidebarAccentForeground: '240 4.8% 95.9%',
    sidebarBorder: '240 3.7% 15.9%',
    sidebarRing: '20.5 90.2% 48.2%',
  },
};

/**
 * Catppuccin - Soothing pastel colors
 */
const catppuccinPalette: AppPaletteConfig = {
  id: 'catppuccin',
  name: 'Catppuccin',
  description: 'Soothing pastel colors',
  light: {
    // Catppuccin Latte
    background: '220 23% 95%',
    foreground: '234 16% 35%',
    card: '220 23% 95%',
    cardForeground: '234 16% 35%',
    popover: '220 23% 95%',
    popoverForeground: '234 16% 35%',
    primary: '266 85% 58%',
    primaryForeground: '220 23% 95%',
    secondary: '223 16% 83%',
    secondaryForeground: '234 16% 35%',
    muted: '223 16% 83%',
    mutedForeground: '233 10% 47%',
    accent: '223 16% 83%',
    accentForeground: '234 16% 35%',
    destructive: '347 87% 44%',
    destructiveForeground: '220 23% 95%',
    border: '225 14% 77%',
    input: '225 14% 77%',
    ring: '266 85% 58%',
    sidebarBackground: '220 22% 92%',
    sidebarForeground: '234 16% 35%',
    sidebarPrimary: '266 85% 58%',
    sidebarPrimaryForeground: '220 23% 95%',
    sidebarAccent: '223 16% 83%',
    sidebarAccentForeground: '234 16% 35%',
    sidebarBorder: '225 14% 77%',
    sidebarRing: '266 85% 58%',
  },
  dark: {
    // Catppuccin Mocha
    background: '240 21% 15%',
    foreground: '226 64% 88%',
    card: '240 21% 15%',
    cardForeground: '226 64% 88%',
    popover: '240 21% 15%',
    popoverForeground: '226 64% 88%',
    primary: '267 84% 81%',
    primaryForeground: '240 21% 15%',
    secondary: '237 16% 23%',
    secondaryForeground: '226 64% 88%',
    muted: '237 16% 23%',
    mutedForeground: '227 35% 80%',
    accent: '237 16% 23%',
    accentForeground: '226 64% 88%',
    destructive: '343 81% 75%',
    destructiveForeground: '240 21% 15%',
    border: '236 16% 23%',
    input: '236 16% 23%',
    ring: '267 84% 81%',
    sidebarBackground: '240 21% 12%',
    sidebarForeground: '226 64% 88%',
    sidebarPrimary: '267 84% 81%',
    sidebarPrimaryForeground: '240 21% 15%',
    sidebarAccent: '237 16% 23%',
    sidebarAccentForeground: '226 64% 88%',
    sidebarBorder: '236 16% 23%',
    sidebarRing: '267 84% 81%',
  },
};

/**
 * Nord - Arctic, north-bluish color palette
 */
const nordPalette: AppPaletteConfig = {
  id: 'nord',
  name: 'Nord',
  description: 'Arctic, north-bluish colors',
  light: {
    // Nord Snow Storm base
    background: '218 27% 94%',
    foreground: '220 16% 22%',
    card: '218 27% 94%',
    cardForeground: '220 16% 22%',
    popover: '218 27% 94%',
    popoverForeground: '220 16% 22%',
    primary: '213 32% 52%',
    primaryForeground: '218 27% 94%',
    secondary: '219 28% 88%',
    secondaryForeground: '220 16% 22%',
    muted: '219 28% 88%',
    mutedForeground: '220 16% 36%',
    accent: '219 28% 88%',
    accentForeground: '220 16% 22%',
    destructive: '354 42% 56%',
    destructiveForeground: '218 27% 94%',
    border: '220 17% 82%',
    input: '220 17% 82%',
    ring: '213 32% 52%',
    sidebarBackground: '219 28% 88%',
    sidebarForeground: '220 16% 22%',
    sidebarPrimary: '213 32% 52%',
    sidebarPrimaryForeground: '218 27% 94%',
    sidebarAccent: '218 27% 94%',
    sidebarAccentForeground: '220 16% 22%',
    sidebarBorder: '220 17% 82%',
    sidebarRing: '213 32% 52%',
  },
  dark: {
    // Nord Polar Night base
    background: '220 16% 22%',
    foreground: '218 27% 94%',
    card: '220 16% 22%',
    cardForeground: '218 27% 94%',
    popover: '220 16% 22%',
    popoverForeground: '218 27% 94%',
    primary: '213 32% 52%',
    primaryForeground: '218 27% 94%',
    secondary: '220 16% 28%',
    secondaryForeground: '218 27% 94%',
    muted: '220 16% 28%',
    mutedForeground: '219 28% 66%',
    accent: '220 16% 28%',
    accentForeground: '218 27% 94%',
    destructive: '354 42% 56%',
    destructiveForeground: '218 27% 94%',
    border: '220 16% 28%',
    input: '220 16% 28%',
    ring: '213 32% 52%',
    sidebarBackground: '220 16% 18%',
    sidebarForeground: '218 27% 94%',
    sidebarPrimary: '213 32% 52%',
    sidebarPrimaryForeground: '218 27% 94%',
    sidebarAccent: '220 16% 28%',
    sidebarAccentForeground: '218 27% 94%',
    sidebarBorder: '220 16% 28%',
    sidebarRing: '213 32% 52%',
  },
};

/**
 * Gruvbox - Retro groove colors
 */
const gruvboxPalette: AppPaletteConfig = {
  id: 'gruvbox',
  name: 'Gruvbox',
  description: 'Retro groove colors',
  light: {
    background: '48 87% 94%',
    foreground: '0 0% 16%',
    card: '48 87% 94%',
    cardForeground: '0 0% 16%',
    popover: '48 87% 94%',
    popoverForeground: '0 0% 16%',
    primary: '27 72% 44%',
    primaryForeground: '48 87% 94%',
    secondary: '48 45% 84%',
    secondaryForeground: '0 0% 16%',
    muted: '48 45% 84%',
    mutedForeground: '0 0% 45%',
    accent: '48 45% 84%',
    accentForeground: '0 0% 16%',
    destructive: '6 96% 46%',
    destructiveForeground: '48 87% 94%',
    border: '48 45% 77%',
    input: '48 45% 77%',
    ring: '27 72% 44%',
    sidebarBackground: '48 45% 89%',
    sidebarForeground: '0 0% 16%',
    sidebarPrimary: '27 72% 44%',
    sidebarPrimaryForeground: '48 87% 94%',
    sidebarAccent: '48 45% 84%',
    sidebarAccentForeground: '0 0% 16%',
    sidebarBorder: '48 45% 77%',
    sidebarRing: '27 72% 44%',
  },
  dark: {
    background: '0 0% 16%',
    foreground: '48 87% 86%',
    card: '0 0% 16%',
    cardForeground: '48 87% 86%',
    popover: '0 0% 16%',
    popoverForeground: '48 87% 86%',
    primary: '27 72% 44%',
    primaryForeground: '48 87% 94%',
    secondary: '0 0% 22%',
    secondaryForeground: '48 87% 86%',
    muted: '0 0% 22%',
    mutedForeground: '48 45% 65%',
    accent: '0 0% 22%',
    accentForeground: '48 87% 86%',
    destructive: '6 96% 59%',
    destructiveForeground: '0 0% 16%',
    border: '0 0% 22%',
    input: '0 0% 22%',
    ring: '27 72% 44%',
    sidebarBackground: '0 0% 12%',
    sidebarForeground: '48 87% 86%',
    sidebarPrimary: '27 72% 44%',
    sidebarPrimaryForeground: '48 87% 94%',
    sidebarAccent: '0 0% 22%',
    sidebarAccentForeground: '48 87% 86%',
    sidebarBorder: '0 0% 22%',
    sidebarRing: '27 72% 44%',
  },
};

/**
 * Amber - Warm amber color scheme
 */
const amberPalette: AppPaletteConfig = {
  id: 'amber',
  name: 'Amber',
  description: 'Warm amber color scheme',
  light: {
    background: '0 0% 100%',
    foreground: '20 14.3% 4.1%',
    card: '0 0% 100%',
    cardForeground: '20 14.3% 4.1%',
    popover: '0 0% 100%',
    popoverForeground: '20 14.3% 4.1%',
    primary: '38 92% 50%',
    primaryForeground: '0 0% 0%',
    secondary: '48 96% 89%',
    secondaryForeground: '20 14.3% 4.1%',
    muted: '48 96% 89%',
    mutedForeground: '25 5.3% 44.7%',
    accent: '48 96% 89%',
    accentForeground: '20 14.3% 4.1%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '60 9.1% 97.8%',
    border: '45 93% 47%',
    input: '45 93% 47%',
    ring: '38 92% 50%',
    sidebarBackground: '48 100% 96%',
    sidebarForeground: '20 14.3% 4.1%',
    sidebarPrimary: '38 92% 50%',
    sidebarPrimaryForeground: '0 0% 0%',
    sidebarAccent: '48 96% 89%',
    sidebarAccentForeground: '20 14.3% 4.1%',
    sidebarBorder: '45 93% 47%',
    sidebarRing: '38 92% 50%',
  },
  dark: {
    background: '20 14.3% 4.1%',
    foreground: '60 9.1% 97.8%',
    card: '20 14.3% 4.1%',
    cardForeground: '60 9.1% 97.8%',
    popover: '20 14.3% 4.1%',
    popoverForeground: '60 9.1% 97.8%',
    primary: '38 92% 50%',
    primaryForeground: '0 0% 0%',
    secondary: '12 6.5% 15.1%',
    secondaryForeground: '60 9.1% 97.8%',
    muted: '12 6.5% 15.1%',
    mutedForeground: '24 5.4% 63.9%',
    accent: '12 6.5% 15.1%',
    accentForeground: '60 9.1% 97.8%',
    destructive: '0 72.2% 50.6%',
    destructiveForeground: '60 9.1% 97.8%',
    border: '43 96% 56%',
    input: '12 6.5% 15.1%',
    ring: '38 92% 50%',
    sidebarBackground: '240 5.9% 10%',
    sidebarForeground: '240 4.8% 95.9%',
    sidebarPrimary: '38 92% 50%',
    sidebarPrimaryForeground: '0 0% 0%',
    sidebarAccent: '240 3.7% 15.9%',
    sidebarAccentForeground: '240 4.8% 95.9%',
    sidebarBorder: '43 96% 56%',
    sidebarRing: '38 92% 50%',
  },
};

/**
 * Blue - Cool blue color scheme
 */
const bluePalette: AppPaletteConfig = {
  id: 'blue',
  name: 'Blue',
  description: 'Cool blue color scheme',
  light: {
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    card: '0 0% 100%',
    cardForeground: '222.2 84% 4.9%',
    popover: '0 0% 100%',
    popoverForeground: '222.2 84% 4.9%',
    primary: '221.2 83.2% 53.3%',
    primaryForeground: '210 40% 98%',
    secondary: '210 40% 96.1%',
    secondaryForeground: '222.2 47.4% 11.2%',
    muted: '210 40% 96.1%',
    mutedForeground: '215.4 16.3% 46.9%',
    accent: '210 40% 96.1%',
    accentForeground: '222.2 47.4% 11.2%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 40% 98%',
    border: '214.3 31.8% 91.4%',
    input: '214.3 31.8% 91.4%',
    ring: '221.2 83.2% 53.3%',
    sidebarBackground: '0 0% 98%',
    sidebarForeground: '240 5.3% 26.1%',
    sidebarPrimary: '221.2 83.2% 53.3%',
    sidebarPrimaryForeground: '0 0% 98%',
    sidebarAccent: '240 4.8% 95.9%',
    sidebarAccentForeground: '240 5.9% 10%',
    sidebarBorder: '220 13% 91%',
    sidebarRing: '221.2 83.2% 53.3%',
  },
  dark: {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    primary: '217.2 91.2% 59.8%',
    primaryForeground: '222.2 47.4% 11.2%',
    secondary: '217.2 32.6% 17.5%',
    secondaryForeground: '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    accent: '217.2 32.6% 17.5%',
    accentForeground: '210 40% 98%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '224.3 76.3% 48%',
    sidebarBackground: '240 5.9% 10%',
    sidebarForeground: '240 4.8% 95.9%',
    sidebarPrimary: '217.2 91.2% 59.8%',
    sidebarPrimaryForeground: '0 0% 100%',
    sidebarAccent: '240 3.7% 15.9%',
    sidebarAccentForeground: '240 4.8% 95.9%',
    sidebarBorder: '240 3.7% 15.9%',
    sidebarRing: '224.3 76.3% 48%',
  },
};

/**
 * Emerald - Fresh green color scheme
 */
const emeraldPalette: AppPaletteConfig = {
  id: 'emerald',
  name: 'Emerald',
  description: 'Fresh green color scheme',
  light: {
    background: '0 0% 100%',
    foreground: '240 10% 3.9%',
    card: '0 0% 100%',
    cardForeground: '240 10% 3.9%',
    popover: '0 0% 100%',
    popoverForeground: '240 10% 3.9%',
    primary: '160 84% 39%',
    primaryForeground: '0 0% 98%',
    secondary: '152 76% 91%',
    secondaryForeground: '160 84% 25%',
    muted: '152 76% 91%',
    mutedForeground: '240 3.8% 46.1%',
    accent: '152 76% 91%',
    accentForeground: '160 84% 25%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '0 0% 98%',
    border: '156 72% 67%',
    input: '156 72% 67%',
    ring: '160 84% 39%',
    sidebarBackground: '152 76% 96%',
    sidebarForeground: '240 5.3% 26.1%',
    sidebarPrimary: '160 84% 39%',
    sidebarPrimaryForeground: '0 0% 98%',
    sidebarAccent: '152 76% 91%',
    sidebarAccentForeground: '160 84% 25%',
    sidebarBorder: '156 72% 67%',
    sidebarRing: '160 84% 39%',
  },
  dark: {
    background: '240 10% 3.9%',
    foreground: '0 0% 98%',
    card: '240 10% 3.9%',
    cardForeground: '0 0% 98%',
    popover: '240 10% 3.9%',
    popoverForeground: '0 0% 98%',
    primary: '158 64% 52%',
    primaryForeground: '144 61% 20%',
    secondary: '240 3.7% 15.9%',
    secondaryForeground: '0 0% 98%',
    muted: '240 3.7% 15.9%',
    mutedForeground: '240 5% 64.9%',
    accent: '240 3.7% 15.9%',
    accentForeground: '0 0% 98%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '0 0% 98%',
    border: '240 3.7% 15.9%',
    input: '240 3.7% 15.9%',
    ring: '158 64% 52%',
    sidebarBackground: '240 5.9% 10%',
    sidebarForeground: '240 4.8% 95.9%',
    sidebarPrimary: '158 64% 52%',
    sidebarPrimaryForeground: '0 0% 100%',
    sidebarAccent: '240 3.7% 15.9%',
    sidebarAccentForeground: '240 4.8% 95.9%',
    sidebarBorder: '240 3.7% 15.9%',
    sidebarRing: '158 64% 52%',
  },
};

/**
 * Fuchsia - Vibrant pink/purple color scheme
 */
const fuchsiaPalette: AppPaletteConfig = {
  id: 'fuchsia',
  name: 'Fuchsia',
  description: 'Vibrant pink/purple color scheme',
  light: {
    background: '0 0% 100%',
    foreground: '240 10% 3.9%',
    card: '0 0% 100%',
    cardForeground: '240 10% 3.9%',
    popover: '0 0% 100%',
    popoverForeground: '240 10% 3.9%',
    primary: '293 69% 49%',
    primaryForeground: '0 0% 98%',
    secondary: '295 90% 93%',
    secondaryForeground: '293 69% 35%',
    muted: '295 90% 93%',
    mutedForeground: '240 3.8% 46.1%',
    accent: '295 90% 93%',
    accentForeground: '293 69% 35%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '0 0% 98%',
    border: '292 91% 73%',
    input: '292 91% 73%',
    ring: '293 69% 49%',
    sidebarBackground: '295 90% 97%',
    sidebarForeground: '240 5.3% 26.1%',
    sidebarPrimary: '293 69% 49%',
    sidebarPrimaryForeground: '0 0% 98%',
    sidebarAccent: '295 90% 93%',
    sidebarAccentForeground: '293 69% 35%',
    sidebarBorder: '292 91% 73%',
    sidebarRing: '293 69% 49%',
  },
  dark: {
    background: '240 10% 3.9%',
    foreground: '0 0% 98%',
    card: '240 10% 3.9%',
    cardForeground: '0 0% 98%',
    popover: '240 10% 3.9%',
    popoverForeground: '0 0% 98%',
    primary: '292 84% 61%',
    primaryForeground: '0 0% 0%',
    secondary: '240 3.7% 15.9%',
    secondaryForeground: '0 0% 98%',
    muted: '240 3.7% 15.9%',
    mutedForeground: '240 5% 64.9%',
    accent: '240 3.7% 15.9%',
    accentForeground: '0 0% 98%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '0 0% 98%',
    border: '240 3.7% 15.9%',
    input: '240 3.7% 15.9%',
    ring: '292 84% 61%',
    sidebarBackground: '240 5.9% 10%',
    sidebarForeground: '240 4.8% 95.9%',
    sidebarPrimary: '292 84% 61%',
    sidebarPrimaryForeground: '0 0% 100%',
    sidebarAccent: '240 3.7% 15.9%',
    sidebarAccentForeground: '240 4.8% 95.9%',
    sidebarBorder: '240 3.7% 15.9%',
    sidebarRing: '292 84% 61%',
  },
};

/**
 * All available app palettes
 */
export const appPalettes: AppPaletteConfig[] = [
  caffeinePalette,
  catppuccinPalette,
  nordPalette,
  gruvboxPalette,
  amberPalette,
  bluePalette,
  emeraldPalette,
  fuchsiaPalette,
];

/**
 * Get a specific palette configuration by ID
 */
export function getAppPalette(id: AppPaletteId): AppPaletteConfig | undefined {
  return appPalettes.find((palette) => palette.id === id);
}

/**
 * Get the default palette (Caffeine)
 */
export function getDefaultAppPalette(): AppPaletteConfig {
  return caffeinePalette;
}

/**
 * CSS custom property names mapped to their property setter keys
 */
const CSS_VAR_MAP: Record<keyof PaletteColors, string> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
  // Note: CSS uses --sidebar, not --sidebar-background
  sidebarBackground: '--sidebar',
  sidebarForeground: '--sidebar-foreground',
  sidebarPrimary: '--sidebar-primary',
  sidebarPrimaryForeground: '--sidebar-primary-foreground',
  sidebarAccent: '--sidebar-accent',
  sidebarAccentForeground: '--sidebar-accent-foreground',
  sidebarBorder: '--sidebar-border',
  sidebarRing: '--sidebar-ring',
};

/**
 * Apply a palette's colors to the document root as CSS custom properties
 * @param paletteId - The palette ID to apply
 * @param mode - Whether to apply light or dark variant
 */
export function applyAppPalette(paletteId: AppPaletteId, mode: 'light' | 'dark'): void {
  const palette = getAppPalette(paletteId);
  if (!palette) {
    console.warn(`Palette "${paletteId}" not found, using default`);
    applyAppPalette('caffeine', mode);
    return;
  }

  const colors = mode === 'dark' ? palette.dark : palette.light;
  const root = document.documentElement;

  // Apply all color variables - wrap HSL values with hsl() function
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    const value = colors[key as keyof PaletteColors];
    if (value) {
      // Wrap raw HSL values with hsl() for CSS compatibility
      const cssValue = value.startsWith('hsl') || value.startsWith('oklch') || value.startsWith('rgb')
        ? value 
        : `hsl(${value})`;
      root.style.setProperty(cssVar, cssValue);
    }
  }
}

/**
 * Remove all palette CSS custom properties from the document root
 * (Reset to CSS defaults)
 */
export function removeAppPalette(): void {
  const root = document.documentElement;
  for (const cssVar of Object.values(CSS_VAR_MAP)) {
    root.style.removeProperty(cssVar);
  }
}

/**
 * Mapping from app palette to recommended terminal theme (for "auto" mode)
 */
export const paletteTerminalMap: Record<AppPaletteId, { dark: string; light: string }> = {
  caffeine: { dark: 'caffeine-dark', light: 'caffeine-light' },
  catppuccin: { dark: 'catppuccin-mocha', light: 'catppuccin-latte' },
  nord: { dark: 'nord', light: 'nord' },
  gruvbox: { dark: 'gruvbox-dark', light: 'gruvbox-light' },
  amber: { dark: 'dark', light: 'light' },
  blue: { dark: 'dark', light: 'light' },
  emerald: { dark: 'dark', light: 'light' },
  fuchsia: { dark: 'dracula', light: 'light' },
};
