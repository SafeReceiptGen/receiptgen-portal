"use client"

import { useEffect } from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { toast as sonnerToast, Toaster as Sonner, type ToasterProps } from "sonner"

const TOAST_EVENT = "safereceipts-toast"

type ToastMessageKind = "success" | "error" | "info" | "warning" | "message"

type ToastDetail =
  | { kind: ToastMessageKind; message: string }
  | {
      kind: "promise"
      promise: Promise<unknown>
      loading: string
      success: string
      error: string
    }

function publish(detail: ToastDetail) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail }))
}

function showToast(detail: ToastDetail) {
  switch (detail.kind) {
    case "success":
      sonnerToast.success(detail.message)
      return
    case "error":
      sonnerToast.error(detail.message)
      return
    case "info":
      sonnerToast.info(detail.message)
      return
    case "warning":
      sonnerToast.warning(detail.message)
      return
    case "message":
      sonnerToast.message(detail.message)
      return
    case "promise":
      sonnerToast.promise(detail.promise, {
        loading: detail.loading,
        success: detail.success,
        error: detail.error,
      })
      return
    default: {
      const _exhaustive: never = detail
      return _exhaustive
    }
  }
}

export const toast = {
  success: (message: string) => publish({ kind: "success", message }),
  error: (message: string) => publish({ kind: "error", message }),
  info: (message: string) => publish({ kind: "info", message }),
  warning: (message: string) => publish({ kind: "warning", message }),
  message: (message: string) => publish({ kind: "message", message }),
  promise: (
    promise: Promise<unknown>,
    messages: { loading: string; success: string; error: string },
  ) =>
    publish({
      kind: "promise",
      promise,
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }),
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastDetail>).detail
      if (!detail) return
      showToast(detail)
    }
    window.addEventListener(TOAST_EVENT, onToast)
    return () => window.removeEventListener(TOAST_EVENT, onToast)
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
