// src/lib/stores/user.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { PUBLIC_API_URL } from '$env/static/public';

let defaultValue = null;

const initialValue = browser && typeof window !== 'undefined'
  ? window.localStorage.getItem('user') ?? defaultValue
  : defaultValue;

const storedUser = initialValue ? JSON.parse(initialValue) : null;

export const user = writable(storedUser);
let cachedUser = storedUser;

function saveUserToLocalStorage(userData) {
  if (browser && typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(userData));
    cachedUser = userData;
  }
}

function clearUser() {
  user.set(null);
  cachedUser = null;
  if (browser && typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

export function updateUser(userData) {
  user.update(currentUser => {
    const updatedUser = { ...currentUser, ...userData };
    saveUserToLocalStorage(updatedUser);
    return updatedUser;
  });
}

export function logoutUser() {
  clearUser();
  // Optional: Call logout endpoint if needed
  fetch(`${PUBLIC_API_URL}/user/logout`, {
    method: 'POST',
    credentials: 'include'
  });
}

async function refreshAccessToken() {
  try {
    const response = await fetch(`${PUBLIC_API_URL}/user/token/refresh`, {
      method: 'POST',
      credentials: 'include', // Send refresh_token via cookie
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Failed to refresh access token');

    const data = await response.json();
    updateUser({ access_token: data.access_token });
    console.log('Access token refreshed');
    return data.access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    logoutUser();
    return null;
  }
}

let refreshInterval = null;

function initializeTokenRefresh() {
  if (refreshInterval) return; // prevent multiple intervals
  // First refresh right away
  refreshAccessToken();

  // Then repeat every 9 minutes (before 10 min expiry)
  const interval = 9 * 60 * 1000;

  refreshInterval = setInterval(async () => {
    await refreshAccessToken();
  }, interval);
}

export function loginUser(userData) {
  saveUserToLocalStorage(userData);
  user.set(userData);
  initializeTokenRefresh();
}

export function checkUser() {
  if (cachedUser) {
    user.set(cachedUser);
    initializeTokenRefresh();
  } else {
    clearUser();
  }
}

checkUser();
