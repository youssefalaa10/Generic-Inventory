import { SUPPLY_INVENTORY } from "@/services/mockData";

// API Configuration
export const API_BASE_URL = (import.meta as any)?.env?.VITE_API_URL || 'https://perfume-commerce.vercel.app/api';

// API Endpoints
export const API_ENDPOINTS = {
  BRANCHES: '/branches',
  // INVENTORY: '/inventory',
  MOVEMENTS: '/movements',
  ORDERS: '/orders',
  SUPPLY_CHAIN: '/supplychains',
  SUPPLY_INVENTORY : "/inventoryitems"
} as const;
