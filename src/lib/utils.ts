import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDuration = (duration: number) => {
  if (duration <= 0) {
    return "00:00";
  }
  // const seconds = Math.floor(duration % 60000) / 1000;
  // const minutes = Math.floor(duration / 60000);
  // Convert duration from milliseconds to seconds
  const totalSeconds = Math.floor(duration / 1000);
  // const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  // return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const snakeCaseToTitleCase = (str: string) => {
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export const compactNumber = (number: number) => {
  return Intl.NumberFormat(`en`, {
    notation: "compact"
  }).format(number)
};