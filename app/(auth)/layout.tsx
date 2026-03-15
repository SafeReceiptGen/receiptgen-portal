import { Footer } from "@/components/landing/v2/Footer";
import type React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}

export default layout;
