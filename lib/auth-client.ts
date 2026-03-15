import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Base URL of backend.
  plugins: [
    adminClient(),
    inferAdditionalFields({
      user: {
        retailerId: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
});
