/**
 * Authentication utilities
 */

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('admin_token');
}

export function getAuthToken(): string | null {
  return localStorage.getItem('admin_token');
}

export function getAdminEmail(): string | null {
  return localStorage.getItem('admin_email');
}

export function logout(): void {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_email');
}



