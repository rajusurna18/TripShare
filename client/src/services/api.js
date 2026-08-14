import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
});

// AUTO TOKEN

API.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;

  },

  (error) => {

    return Promise.reject(error);

  }
);

// RESPONSE INTERCEPTOR
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("activeTripId");
      
      // We dispatch a custom event so the UI can update if it wants to, 
      // but we DO NOT force a hard redirect here anymore.
      window.dispatchEvent(new Event("auth-expired"));
    }
    return Promise.reject(error);
  }
);

export default API;