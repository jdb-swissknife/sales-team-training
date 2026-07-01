/**
 * branding.js - Central branding configuration
 *
 * Change these values to white-label the app for any client.
 * MindVault is the default; swap name/colors/logo for client deployments.
 *
 * Example client override (in a separate file imported before app load):
 *   import { setBranding } from '@/lib/branding';
 *   setBranding({ appName: 'WolfPack Training', teamName: 'The Pack' });
 */

const DEFAULT = {
  appName: "MindVault",
  appTagline: "Sales Performance Platform",
  teamName: "Your Team",
  logo: "M", // Single character for avatar circle, or path to image
  // Color theme (used in Layout CSS vars)
  primaryHue: 217,   // blue
  primarySat: 91,
  primaryLight: 30,
  accentHue: 25,     // orange
  accentSat: 95,
  accentLight: 53,
  // Sidebar gradient
  gradientFrom: "from-blue-600",
  gradientTo: "to-indigo-700",
  // Links
  routeBlitzerUrl: "", // Set to Route Blitzer URL when known
};

let current = { ...DEFAULT };

export function getBranding() {
  return current;
}

export function setBranding(overrides) {
  current = { ...current, ...overrides };
}

export const branding = current;
