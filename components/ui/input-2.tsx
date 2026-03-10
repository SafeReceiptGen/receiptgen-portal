import React, { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  className,
  id,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const labelRef = useRef<HTMLLabelElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (isFocused || hasValue) {
        gsap.to(labelRef.current, {
          y: -24,
          scale: 0.85,
          transformOrigin: "left top",
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        gsap.to(labelRef.current, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    },
    { dependencies: [isFocused, hasValue] },
  );

  useGSAP(
    () => {
      if (isFocused) {
        gsap.to(lineRef.current, {
          scaleX: 1,
          duration: 0.4,
          ease: "power3.out",
        });
      } else {
        gsap.to(lineRef.current, {
          scaleX: 0,
          duration: 0.4,
          ease: "power3.out",
        });
      }
    },
    { dependencies: [isFocused] },
  );

  return (
    <div className={cn("relative mt-6 w-full", className)}>
      <label
        ref={labelRef}
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-3 text-foreground/50 transition-colors"
      >
        {label}
      </label>
      <input
        id={id}
        className="w-full border-b border-foreground/20 bg-transparent py-3 text-foreground outline-none transition-colors hover:border-foreground/40"
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          setHasValue(e.target.value.length > 0);
          props.onBlur?.(e);
        }}
        onChange={(e) => {
          setHasValue(e.target.value.length > 0);
          props.onChange?.(e);
        }}
        {...props}
      />
      <div
        ref={lineRef}
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-primary"
      />
    </div>
  );
};
