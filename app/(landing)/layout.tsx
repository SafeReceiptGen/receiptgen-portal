import Header from "@/components/Header";
import type React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

export default layout;
