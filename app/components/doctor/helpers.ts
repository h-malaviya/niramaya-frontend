import { DoctorsApiParams } from "./types";

// Build query string from filter parameters
export function buildQueryString(params: DoctorsApiParams): string {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.fees_min !== undefined) queryParams.append("fees_min", params.fees_min.toString());
  if (params.fees_max !== undefined) queryParams.append("fees_max", params.fees_max.toString());
  if (params.category && params.category.length > 0) {
    params.category.forEach(cat => queryParams.append("category", cat));
  }
  if (params.location) queryParams.append("location", params.location);
  if (params.experience_min !== undefined) queryParams.append("experience_min", params.experience_min.toString());
  if (params.experience_max !== undefined) queryParams.append("experience_max", params.experience_max.toString());
  if (params.gender && params.gender.length > 0) {
    params.gender.forEach(g => queryParams.append("gender", g));
  }
  
  return queryParams.toString();
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format experience years
export function formatExperience(years: number): string {
  if (years === 1) return "1 year";
  return `${years} years`;
}