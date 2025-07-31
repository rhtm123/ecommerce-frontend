import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { PUBLIC_API_URL } from '$env/static/public';

// Define default value for user
let defaultValue = null;

// Safely access localStorage only if running in the browser
const initialValue = browser && typeof window !== 'undefined' 
  ? window.localStorage.getItem('user') ?? defaultValue 
  : defaultValue;

const storedUser = initialValue ? JSON.parse(initialValue) : null;

// Svelte store for user
export const user = writable(storedUser);

// Cache user data in memory
let cachedUser = storedUser;

export function updateUser(userData) {
  // Merge existing user data with new data
  user.update(currentUser => {
    const updatedUser = { ...currentUser, ...userData }; // Merge the objects
    saveUserToLocalStorage(updatedUser);
    return updatedUser; // Return the updated user
  });
}

function saveUserToLocalStorage(userData) {
  if (browser && typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(userData));
    cachedUser = userData; // Update cache
  }
}

function clearUser() {
  console.log("Clearing user");
  user.set(null);
  cachedUser = null;
  if (browser && typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

async function refreshAccessToken() {
  try {
    const response = await fetch(`${PUBLIC_API_URL}/user/token/refresh`, {
      method: 'POST',
      credentials: 'include', // 🔥 Send cookie!,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(response);

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    updateUser({ access_token: data.access_token });
    return data.access_token;
  } catch (error) {
    console.error('Token refresh failed', error);
    logoutUser();
    return null;
  }
}

function initializeTokenRefresh(userData) {
  setTimeout(() => {
    refreshAccessToken(userData);
    const interval = 60 * 30 * 1000; // 30 minutes
    setInterval(async () => {
      await refreshAccessToken(userData);
    }, interval);
  }, 0); // Defer execution
}

export function loginUser(userData) {
  console.log('Login successful:', userData);
  saveUserToLocalStorage(userData);
  user.set(userData);
  initializeTokenRefresh(userData);
}

export function logoutUser() {
  console.log('Logout successful');
  clearUser();
}

// Immediately check if user exists and set the store
export function checkUser() {
  if (cachedUser) {
    user.set(cachedUser);
    initializeTokenRefresh(cachedUser);
  } else {
    clearUser();
  }
}

// Initialize the store on app load
checkUser();
