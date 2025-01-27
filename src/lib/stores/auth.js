import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { myFetch } from '$lib/utils/myFetch';
import { PUBLIC_API_URL } from '$env/static/public';


// @ts-ignore
let defaultValue;
const initialValue = browser ? window.localStorage.getItem('user') ?? defaultValue : defaultValue;

const storedUser = initialValue;
export const user = writable(storedUser);

function saveUserToLocalStorage(userData) {
  localStorage.setItem('user', JSON.stringify(userData));
}

// Helper function to clear user data
function clearUser() {
  localStorage.removeItem('user');
  user.set(null);
}


async function refreshAccessToken() {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  if (!currentUser || !currentUser.refresh_token) {
      clearUser();
      return null;
  }

  try {
      const response = await fetch(`${PUBLIC_API_URL}/token/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: currentUser.refresh_token }),
      });

      if (!response.ok) {
          throw new Error('Failed to refresh access token');
      }

      const data = await response.json();
      const updatedUser = { ...currentUser, access_token: data.access };
      saveUserToLocalStorage(updatedUser);
      user.set(updatedUser);
      return updatedUser.access_token;
  } catch (error) {
      console.error('Error refreshing access token:', error);
      clearUser();
      return null;
  }
}


function initializeTokenRefresh() {
  const interval = 60 * 30 * 1000; // 30 minutes in milliseconds

  setInterval(async () => {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
          console.log('Access token refreshed successfully');
      }
  }, interval);
}


export function loginUser(userData) {
  // console.log('Login successful')
  saveUserToLocalStorage(userData);
  user.set(userData);
  initializeTokenRefresh();
}

export function logoutUser() {
  clearUser();
}

// Initialize the store on app load
if (storedUser) {
  initializeTokenRefresh();
}