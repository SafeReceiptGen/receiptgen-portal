import { StoresClient } from "@/components/dashboard/store/stores-client";

export const metadata = {
  title: "Stores",
  description: "Manage your retail stores.",
};

export default function StoresPage() {
  return <StoresClient />;
}
