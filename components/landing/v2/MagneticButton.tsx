"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  magneticStrength?: number;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className,
  magneticStrength = 0.3,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const button = buttonRef.current;
      if (!button) return;

      const xTo = gsap.quickTo(button, "x", {
        duration: 1,
        ease: "elastic.out(1, 0.3)",
      });
      const yTo = gsap.quickTo(button, "y", {
        duration: 1,
        ease: "elastic.out(1, 0.3)",
      });

      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = button.getBoundingClientRect();
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);
        xTo(x * magneticStrength);
        yTo(y * magneticStrength);
      };

      const handleMouseLeave = () => {
        xTo(0);
        yTo(0);
      };

      button.addEventListener("mousemove", handleMouseMove);
      button.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        button.removeEventListener("mousemove", handleMouseMove);
        button.removeEventListener("mouseleave", handleMouseLeave);
      };
    },
    { scope: buttonRef, dependencies: [magneticStrength] },
  );

  return (
    <button
      ref={buttonRef}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-4 font-medium transition-colors",
        "bg-primary text-white hover:bg-primary-dark",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};
