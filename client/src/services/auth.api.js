import API from "./api";

// REGISTER

export const register = (data) =>
  API.post(
    "/api/auth/register",
    data
  );

// LOGIN

export const login = (data) =>
  API.post(
    "/api/auth/login",
    data
  );