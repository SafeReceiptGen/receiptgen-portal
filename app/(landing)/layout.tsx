import { Footer } from "@/components/landing/v2/Footer";
import HeaderAuthWrapper from "@/components/landing/v2/header/header-auth-wrapper";
import type React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderAuthWrapper />
      {children}
      <Footer />
    </>
  );
}

export default layout;
