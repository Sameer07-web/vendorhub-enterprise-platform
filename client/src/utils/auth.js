export const getToken = () => {
  return localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Internal helper for manual JWT decode since we cannot install jwt-decode
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  // Expected to return { _id, role, ... }
  return decoded || null;
};

export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

export const hasAnyRole = (...roles) => {
  const user = getCurrentUser();
  return user && roles.includes(user.role);
};
