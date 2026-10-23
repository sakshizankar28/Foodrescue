// frontend/src/services/api.js
// Purpose: Centralized API client using relative URL (/api) for unified single-origin hosting.
// Handles baseURL, JWT token headers, JSON and FormData requests, and HTTP errors.

const BASE_URL = '/api';

/**
 * Core helper that wraps the browser's native Fetch API.
 * Automatically adds Authorization header and handles both JSON and multipart FormData.
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    ...(options.headers || {}),
  };

  // Only set Content-Type to application/json if body is NOT a FormData instance.
  // When body is FormData, the browser automatically generates multipart/form-data with the boundary.
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const url = `${BASE_URL}${endpoint}`;
  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    throw new Error('Cannot connect to backend server. Please make sure the server is running on http://localhost:3000.');
  }


  // Parse JSON response (or handle empty response body)
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    const text = await response.text().catch(() => '');
    data = text ? { message: text } : null;
  }

  // Handle unauthorized/expired token
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      window.location.href = '/login';
    }
  }

  // If status is not 2xx, throw an error with the backend message
  if (!response.ok) {
    const errorMessage = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.response = { status: response.status, data };
    throw error;
  }

  return { data, status: response.status };
}

// ── Auth APIs ────────────────────────────────────────────────────────
export const registerUser = (userData) =>
  apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const loginUser = (credentials) =>
  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getMe = () =>
  apiRequest('/auth/me', {
    method: 'GET',
  });

export const updateProfile = (profileData) =>
  apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });


// ── Food APIs ────────────────────────────────────────────────────────
export const getAllFood = () =>
  apiRequest('/food', {
    method: 'GET',
  });

export const getMyFood = () =>
  apiRequest('/food/mine', {
    method: 'GET',
  });

export const getFoodById = (id) =>
  apiRequest(`/food/${id}`, {
    method: 'GET',
  });

// addFood supports both FormData (with photo) and plain JSON
export const addFood = (foodData) => {
  const body = foodData instanceof FormData ? foodData : JSON.stringify(foodData);
  return apiRequest('/food', {
    method: 'POST',
    body,
  });
};

export const updateFoodStatus = (id, status) =>
  apiRequest(`/food/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

export const deleteFood = (id) =>
  apiRequest(`/food/${id}`, {
    method: 'DELETE',
  });

// ── Request APIs ─────────────────────────────────────────────────────
export const getMyRequests = () =>
  apiRequest('/requests/mine', {
    method: 'GET',
  });

export const getIncomingRequests = () =>
  apiRequest('/requests/incoming', {
    method: 'GET',
  });

export const createRequest = (requestData) =>
  apiRequest('/requests', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });

export const updateRequestStatus = (id, status) =>
  apiRequest(`/requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export default {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  getAllFood,
  getMyFood,
  getFoodById,
  addFood,
  updateFoodStatus,
  deleteFood,
  getMyRequests,
  getIncomingRequests,
  createRequest,
  updateRequestStatus,
};
