import { 
  MenuItem, 
  CreateOrderRequest, 
  Order, 
  AdminLoginRequest, 
  AdminLoginResponse 
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Check if we're in dev mode with a dev token
function isDevMode(): boolean {
  const token = localStorage.getItem('admin_token');
  return import.meta.env.DEV && (token?.startsWith('dev-token-') ?? false);
}

/**
 * API client for Gio's Corner backend
 */

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    console.error('API Error Response:', error);
    if (error.details) {
      console.error('Validation Details:', JSON.stringify(error.details, null, 2));
    }
    throw new Error(error.error || error.message || 'Request failed');
  }
  return response.json();
}

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('admin_token');
}

// Helper to create auth headers
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

/**
 * Public API endpoints
 */

export async function getMenu(): Promise<{ menuItems: MenuItem[] }> {
  const response = await fetch(`${API_URL}/api/menu`);
  return handleResponse(response);
}

export async function createOrder(orderData: CreateOrderRequest): Promise<{ message: string; order: Order }> {
  console.log('Creating order with data:', orderData);
  const response = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  return handleResponse(response);
}

/**
 * Admin API endpoints
 */

export async function adminLogin(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await handleResponse<AdminLoginResponse>(response);
  
  // Store token in localStorage
  if (data.token) {
    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('admin_email', data.email);
  }
  
  return data;
}

export async function getOrders(status?: string): Promise<{ orders: Order[] }> {
  // Return mock data in dev mode
  if (isDevMode()) {
    return getMockOrders(status);
  }
  
  const url = status 
    ? `${API_URL}/api/admin/orders?status=${status}`
    : `${API_URL}/api/admin/orders`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function getOrderById(orderId: string): Promise<{ order: Order }> {
  const response = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function approveOrder(
  orderId: string, 
  approvalMessage: string
): Promise<{ message: string; order: Order }> {
  // Mock response in dev mode
  if (isDevMode()) {
    return mockApproveOrder(orderId, approvalMessage);
  }
  
  const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ approval_message: approvalMessage }),
  });
  return handleResponse(response);
}

export async function confirmTimeAndSendInvoice(
  orderId: string, 
  totalPriceCents?: number
): Promise<{ message: string; order: Order }> {
  // Mock response in dev mode
  if (isDevMode()) {
    return mockConfirmTimeAndSendInvoice(orderId, totalPriceCents);
  }
  
  const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/confirm-time-and-send-invoice`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ total_price_cents: totalPriceCents }),
  });
  return handleResponse(response);
}

export async function markOrderAsPaid(
  orderId: string
): Promise<{ message: string; order: Order }> {
  // Mock response in dev mode
  if (isDevMode()) {
    return mockMarkOrderAsPaid(orderId);
  }
  
  const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/mark-paid`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function denyOrder(
  orderId: string, 
  adminReason: string
): Promise<{ message: string; order: Order }> {
  // Mock response in dev mode
  if (isDevMode()) {
    return mockDenyOrder(orderId, adminReason);
  }
  
  const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/deny`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ admin_reason: adminReason }),
  });
  return handleResponse(response);
}

/**
 * Menu Management API endpoints
 */

export async function getMenuItems(): Promise<{ menuItems: MenuItem[] }> {
  const response = await fetch(`${API_URL}/api/admin/menu`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function getMenuItemById(itemId: string): Promise<{ menuItem: MenuItem }> {
  const response = await fetch(`${API_URL}/api/admin/menu/${itemId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function createMenuItem(menuItem: Partial<MenuItem>): Promise<{ message: string; menuItem: MenuItem }> {
  const response = await fetch(`${API_URL}/api/admin/menu`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(menuItem),
  });
  return handleResponse(response);
}

export async function updateMenuItem(itemId: string, updates: Partial<MenuItem>): Promise<{ message: string; menuItem: MenuItem }> {
  const response = await fetch(`${API_URL}/api/admin/menu/${itemId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
}

export async function deleteMenuItem(itemId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/admin/menu/${itemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * Auth helpers
 */

export function logout(): void {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_email');
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getAdminEmail(): string | null {
  return localStorage.getItem('admin_email');
}

/**
 * Mock data for dev mode
 */

// Store mock orders in memory
let mockOrdersData: Order[] = [
  {
    id: 'mock-order-1',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    address: '123 Main St, Boston, MA 02101',
    date_needed: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    food_selection: [
      { menu_item_id: 'Lasagna', quantity: 2, notes: 'Extra cheese please' },
      { menu_item_id: 'Tiramisu', quantity: 1, notes: '' },
    ],
    notes: 'Please deliver between 5-6 PM',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-order-2',
    customer_name: 'Jane Smith',
    customer_email: 'jane@example.com',
    address: '456 Oak Ave, Cambridge, MA 02138',
    date_needed: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    food_selection: [
      { menu_item_id: 'Chicken Parm', quantity: 3, notes: '' },
      { menu_item_id: 'Caesar Salad', quantity: 2, notes: 'No croutons' },
    ],
    notes: '',
    status: 'pending',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-order-3',
    customer_name: 'Bob Johnson',
    customer_email: 'bob@example.com',
    address: '789 Elm St, Somerville, MA 02144',
    date_needed: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    food_selection: [
      { menu_item_id: 'Eggplant Parm', quantity: 1, notes: '' },
    ],
    notes: 'Vegetarian option needed',
    status: 'paid',
    approval_message: 'I can deliver between 5-6 PM on that day.',
    total_price_cents: 2500,
    stripe_invoice_url: 'https://invoice.stripe.com/i/mock-invoice',
    time_confirmed_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    invoice_sent_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-order-4',
    customer_name: 'Alice Williams',
    customer_email: 'alice@example.com',
    address: '321 Pine Rd, Brookline, MA 02445',
    date_needed: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    food_selection: [
      { menu_item_id: 'Meatballs', quantity: 4, notes: '' },
    ],
    notes: 'Need for party',
    status: 'denied',
    admin_reason: 'Sorry, we are fully booked for that date.',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
];

function getMockOrders(status?: string): Promise<{ orders: Order[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredOrders = mockOrdersData;
      if (status) {
        filteredOrders = mockOrdersData.filter(order => order.status === status);
      }
      resolve({ orders: filteredOrders });
    }, 500); // Simulate network delay
  });
}

function mockApproveOrder(orderId: string, approvalMessage: string): Promise<{ message: string; order: Order }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orderIndex = mockOrdersData.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        mockOrdersData[orderIndex] = {
          ...mockOrdersData[orderIndex],
          status: 'approved_pending_time',
          approval_message: approvalMessage,
          updated_at: new Date().toISOString(),
        };
        resolve({
          message: 'Order approved successfully',
          order: mockOrdersData[orderIndex],
        });
      }
    }, 500);
  });
}

function mockConfirmTimeAndSendInvoice(orderId: string, totalPriceCents?: number): Promise<{ message: string; order: Order }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orderIndex = mockOrdersData.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        mockOrdersData[orderIndex] = {
          ...mockOrdersData[orderIndex],
          status: 'invoice_sent',
          time_confirmed_at: new Date().toISOString(),
          invoice_sent_at: new Date().toISOString(),
          total_price_cents: totalPriceCents || 5000,
          stripe_invoice_url: 'https://invoice.stripe.com/i/mock-invoice-' + orderId,
          updated_at: new Date().toISOString(),
        };
        resolve({
          message: 'Time confirmed and invoice sent successfully',
          order: mockOrdersData[orderIndex],
        });
      }
    }, 500);
  });
}

function mockMarkOrderAsPaid(orderId: string): Promise<{ message: string; order: Order }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orderIndex = mockOrdersData.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        mockOrdersData[orderIndex] = {
          ...mockOrdersData[orderIndex],
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        resolve({
          message: 'Order marked as paid successfully',
          order: mockOrdersData[orderIndex],
        });
      }
    }, 500);
  });
}

function mockDenyOrder(orderId: string, adminReason: string): Promise<{ message: string; order: Order }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orderIndex = mockOrdersData.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        mockOrdersData[orderIndex] = {
          ...mockOrdersData[orderIndex],
          status: 'denied',
          admin_reason: adminReason,
          updated_at: new Date().toISOString(),
        };
        resolve({
          message: 'Order denied successfully',
          order: mockOrdersData[orderIndex],
        });
      }
    }, 500);
  });
}

