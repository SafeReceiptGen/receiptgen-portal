import { createAuthClient } from "better-auth/react";

const API_URL = "http://localhost:3001";

export const authClient = createAuthClient({
  baseURL: API_URL, // Base URL of backend.
});
