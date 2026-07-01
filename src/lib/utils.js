import { Link } from "react-router-dom";

// Vite handles the @ alias, but keep createPageUrl for the routing pattern
export function createPageUrl(pageName) {
  return `/${pageName.toLowerCase()}`;
}

// Re-export commonly used utils
export { cn } from "@/lib/utils-helper";
