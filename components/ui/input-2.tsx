import React, { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  className,
  defaultValue,
  id,
  type = "text",
  disabled,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && passwordVisible ? "text" : type;
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
        {...props}
        id={id}
        type={inputType}
        defaultValue={defaultValue}
        disabled={disabled}
        className={cn(
          "w-full border-b border-foreground/20 bg-transparent py-3 text-foreground outline-none transition-colors hover:border-foreground/40",
          isPassword && "pr-9",
        )}
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
      />
      {isPassword ? (
        <button
          type="button"
          disabled={disabled}
          aria-label={passwordVisible ? "Hide password" : "Show password"}
          aria-pressed={passwordVisible}
          onClick={() => setPasswordVisible((visible) => !visible)}
          className="absolute bottom-3 right-0 text-foreground/45 transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          {passwordVisible ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      ) : null}
      <div
        ref={lineRef}
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-primary"
      />
    </div>
  );
};
