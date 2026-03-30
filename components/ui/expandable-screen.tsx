"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

// Context
interface ExpandableScreenContextValue {
  isExpanded: boolean;
  isExiting: boolean;
  isOpening: boolean;
  expand: () => void;
  collapse: () => void;
  layoutId: string;
  triggerRadius: string;
  contentRadius: string;
  animationDuration: number;
}

const ExpandableScreenContext =
  createContext<ExpandableScreenContextValue | null>(null);

function useExpandableScreen() {
  const context = useContext(ExpandableScreenContext);
  if (!context) {
    throw new Error(
      "useExpandableScreen must be used within an ExpandableScreen",
    );
  }
  return context;
}

// Root Component
interface ExpandableScreenProps {
  children: ReactNode;
  defaultExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  layoutId?: string;
  triggerRadius?: string;
  contentRadius?: string;
  animationDuration?: number;
  lockScroll?: boolean;
}

export function ExpandableScreen({
  children,
  defaultExpanded = false,
  onExpandChange,
  layoutId = "expandable-card",
  triggerRadius = "100px",
  contentRadius = "24px",
  animationDuration = 0.3,
  lockScroll = true,
}: ExpandableScreenProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isExiting, setIsExiting] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const expand = () => {
    setIsExpanded(true);
    setIsOpening(true);
    setIsExiting(false);
    // Clear opening state after the layout animation completes
    setTimeout(() => {
      setIsOpening(false);
    }, animationDuration * 1000);
    onExpandChange?.(true);
  };

  const collapse = () => {
    setIsExiting(true);
    // Delay the actual collapse to allow exit animation
    setTimeout(() => {
      setIsExpanded(false);
      setIsExiting(false);
      onExpandChange?.(false);
    }, animationDuration * 1000);
  };

  useEffect(() => {
    if (lockScroll) {
      if (isExpanded) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    }
  }, [isExpanded, lockScroll]);

  return (
    <ExpandableScreenContext.Provider
      value={{
        isExpanded,
        isExiting,
        isOpening,
        expand,
        collapse,
        layoutId,
        triggerRadius,
        contentRadius,
        animationDuration,
      }}
    >
      {children}
    </ExpandableScreenContext.Provider>
  );
}

// Trigger Component
interface ExpandableScreenTriggerProps {
  children: ReactNode;
  className?: string;
  /** Fires when the user opens the panel (before expand animation). */
  onOpen?: () => void;
}

export function ExpandableScreenTrigger({
  children,
  className = "",
  onOpen,
}: ExpandableScreenTriggerProps) {
  const { isExpanded, expand, layoutId, triggerRadius } = useExpandableScreen();

  const handleOpen = () => {
    onOpen?.();
    expand();
  };

  return (
    <AnimatePresence initial={false}>
      {!isExpanded && (
        <motion.div className={`inline-block relative ${className}`}>
          {/* Background layer with shared layoutId for morphing */}
          <motion.div
            style={{
              borderRadius: triggerRadius,
            }}
            layout
            layoutId={layoutId}
            className="absolute inset-0 transform-gpu will-change-transform"
          />
          {/* Content layer that fades out on expand */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout={false}
            onClick={handleOpen}
            className="relative cursor-pointer"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Content Component
interface ExpandableScreenContentProps {
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeButtonClassName?: string;
}

export function ExpandableScreenContent({
  children,
  className = "",
  showCloseButton = true,
  closeButtonClassName = "",
}: ExpandableScreenContentProps) {
  const {
    isExpanded,
    isExiting,
    isOpening,
    collapse,
    layoutId,
    contentRadius,
    animationDuration,
  } = useExpandableScreen();

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-2">
          {/* Morphing background with shared layoutId */}
          <motion.div
            layoutId={layoutId}
            transition={{ duration: animationDuration, ease: "easeInOut" }}
            style={{
              borderRadius: contentRadius,
            }}
            layout
            className={`relative flex h-full w-full overflow-hidden transform-gpu will-change-transform ${className}`}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isExiting ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{
                delay: isExiting ? 0 : animationDuration,
                duration: isExiting ? 0.2 : 0.3,
                ease: "easeOut",
              }}
              className="relative z-20 h-full w-full overflow-hidden custom-scrollbar"
            >
              {children}
            </motion.div>

            {showCloseButton && (
              <motion.button
                onClick={collapse}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isExiting ? 0 : 1,
                  scale: isExiting ? 0.8 : 1,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  delay: isExiting ? 0 : animationDuration + 0.1,
                  duration: 0.2,
                  ease: "easeOut",
                }}
                className={`absolute right-6 top-6 z-30 flex h-10 w-10 items-center justify-center transition-colors rounded-full ${
                  closeButtonClassName ||
                  "text-white bg-transparent hover:bg-white/10"
                }`}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Background Component (optional)
interface ExpandableScreenBackgroundProps {
  trigger?: ReactNode;
  content?: ReactNode;
  className?: string;
}

export function ExpandableScreenBackground({
  trigger,
  content,
  className = "",
}: ExpandableScreenBackgroundProps) {
  const { isExpanded } = useExpandableScreen();

  if (isExpanded && content) {
    return <div className={className}>{content}</div>;
  }

  if (!isExpanded && trigger) {
    return <div className={className}>{trigger}</div>;
  }

  return null;
}

export { useExpandableScreen };
