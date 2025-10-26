// API Configuration
export const API_BASE_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:4000/api';

// API Endpoints
export const API_ENDPOINTS = {
  BRANCHES: '/branches',
  INVENTORY: '/inventory',
  MOVEMENTS: '/movements',
  ORDERS: '/orders',
  SUPPLY_CHAIN: '/supply-chain',
} as const;
