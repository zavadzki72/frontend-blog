import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper function to get locale from language
function getLocale(language?: string): string {
  return language === "en" ? "en-US" : "pt-BR";
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string, language?: string): string {
  const locale = getLocale(language);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: string, language?: string): string {
  const locale = getLocale(language);
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim("-");
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export function getInitials(name: string): string {
  if (!name) return "";
  
  return name
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function createPostUrl(id: string, title: string): string {
  return `/post/${id}/${slugify(title)}`;
}

export function createCategoryUrl(id: string, name: string): string {
  return `/category/${id}/${slugify(name)}`;
}

export function extractTextFromMarkdown(markdown: string, maxLength: number = 200): string {
  // Remove markdown syntax
  const text = markdown
    .replace(/#{1,6}\s+/g, "") // headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1") // italic
    .replace(/`(.*?)`/g, "$1") // inline code
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // links
    .replace(/^\s*[-*+]\s+/gm, "") // list items
    .replace(/^\s*\d+\.\s+/gm, "") // numbered lists
    .replace(/\n+/g, " ") // newlines
    .trim();

  return truncateText(text, maxLength);
}
