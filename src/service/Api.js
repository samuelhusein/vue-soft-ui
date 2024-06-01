// src/api.js

import axios from "axios";
import Cookies from "js-cookie";

// Base URL for your API (relative URL)
const API_URL = "http://127.0.0.1:8000/api/v1";
const LOGIN_API_URL = "http://127.0.0.1:8000/api";

// Create an Axios instance for unauthenticated requests
const unauthenticatedApi = axios.create({
    baseURL: LOGIN_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Function to get the token from cookies
export function getToken() {
    const token = Cookies.get("token");
    if (token && isValidToken(token)) {
        return token;
    } else {
        removeToken(); 
        return undefined; 
    }
}

function isValidToken() {
    
    return true; 
}

// Function to set the token in cookies
export function setToken(token) {
    Cookies.set("token", token, { expires: 7 }); 
}

// Function to remove the token from cookies
export function removeToken() {
    Cookies.remove("token");
}

// Create an Axios instance for authenticated requests
const authenticatedApi = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to include the token in the headers
authenticatedApi.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Unauthenticated POST request
export const unauthenticatedPost = (endpoint, data) => {
    return unauthenticatedApi.post(endpoint, data);
};

// Authenticated POST request
export const authenticatedPost = (endpoint, data) => {
    return authenticatedApi.post(endpoint, data);
};

// Authenticated GET request
export const authenticatedGet = (endpoint, params) => {
    return authenticatedApi.get(endpoint, { params });
};

// Authenticated PUT request
export const authenticatedPut = (endpoint, data) => {
    return authenticatedApi.put(endpoint, data);
};

// Authenticated DELETE request
export const authenticatedDelete = (endpoint) => {
    return authenticatedApi.delete(endpoint);
};
