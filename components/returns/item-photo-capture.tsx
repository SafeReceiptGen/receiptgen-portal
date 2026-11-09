"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, SwitchCamera } from "lucide-react";
import { cn } from "@/lib/utils";

type FacingMode = "environment" | "user";

interface ItemPhotoCaptureProps {
  photo: string | null;
  onPhotoChange: (photo: string | null) => void;
  required: boolean;
  className?: string;
}

const MAX_EDGE = 1600;
const JPEG_QUALITIES = [0.72, 0.6, 0.45];
const MAX_BYTES = 4.5 * 1024 * 1024;

function cameraErrorMessage(error: unknown): string {
  if (
    typeof navigator !== "undefined" &&
    (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
  ) {
    return "This browser cannot use the camera. Open the return on a phone or a computer with a webcam.";
  }
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera permission was denied. Allow camera access to take a photo of the item.";
  }
  if (
    name === "NotFoundError" ||
    name === "DevicesNotFoundError" ||
    name === "OverconstrainedError"
  ) {
    return "No camera was found on this device.";
  }
  if (name === "NotReadableError") {
    return "The camera is already in use by another app.";
  }
  return "Could not open the camera.";
}

function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.floor((base64.length * 3) / 4);
}

function compressVideoFrame(video: HTMLVideoElement): string {
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  if (!sourceWidth || !sourceHeight) {
    throw new Error("Camera is still starting. Try again in a moment.");
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(sourceWidth, sourceHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not capture the photo.");
  }
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  let dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITIES[0]);
  for (const quality of JPEG_QUALITIES.slice(1)) {
    if (dataUrlBytes(dataUrl) <= MAX_BYTES) break;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrlBytes(dataUrl) > MAX_BYTES) {
    throw new Error("The photo is still too large. Move closer and try again.");
  }
  return dataUrl;
}

async function requestStream(facing: FacingMode): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: facing },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  });
}

export function ItemPhotoCapture({
  photo,
  onPhotoChange,
  required,
  className,
}: ItemPhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<FacingMode>("environment");
  const [live, setLive] = useState(false);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!live || !video || !stream) return;
    video.srcObject = stream;
    void video.play().catch(() => {
      setError("Could not start the camera preview.");
    });
    return () => {
      video.srcObject = null;
    };
  }, [live, facing]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const openCamera = async (nextFacing: FacingMode, allowFallback: boolean) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(cameraErrorMessage(new Error("unsupported")));
      return;
    }
    setError(null);
    setOpening(true);
    let facingMode = nextFacing;
    try {
      let stream: MediaStream;
      try {
        stream = await requestStream(facingMode);
      } catch (openError) {
        const name = openError instanceof DOMException ? openError.name : "";
        const canFallBack =
          allowFallback &&
          facingMode === "environment" &&
          (name === "OverconstrainedError" ||
            name === "NotFoundError" ||
            name === "DevicesNotFoundError");
        if (!canFallBack) throw openError;
        stream = await requestStream("user");
        facingMode = "user";
      }
      stopStream();
      streamRef.current = stream;
      setFacing(facingMode);
      setLive(true);
    } catch (openError) {
      setLive(false);
      setError(cameraErrorMessage(openError));
    } finally {
      setOpening(false);
    }
  };

  const flipCamera = async () => {
    const nextFacing = facing === "environment" ? "user" : "environment";
    setError(null);
    try {
      const stream = await requestStream(nextFacing);
      stopStream();
      streamRef.current = stream;
      setFacing(nextFacing);
      setLive(true);
    } catch {
      setError("Could not switch cameras. This device may only have one camera.");
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const dataUrl = compressVideoFrame(video);
      stopStream();
      setLive(false);
      setError(null);
      onPhotoChange(dataUrl);
    } catch (captureError) {
      setError(
        captureError instanceof Error
          ? captureError.message
          : "Could not capture the photo.",
      );
    }
  };

  const retake = () => {
    onPhotoChange(null);
    setError(null);
    void openCamera(facing, true);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {photo ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt="Item being returned"
              className="aspect-4/3 w-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={retake}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/8"
          >
            Retake photo
          </button>
        </div>
      ) : live ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-black dark:border-white/10">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className={cn(
              "aspect-4/3 w-full object-cover",
              facing === "user" && "-scale-x-100",
            )}
          />
          <div className="flex gap-2 bg-slate-950 p-3">
            <button
              type="button"
              onClick={() => void flipCamera()}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <SwitchCamera size={16} />
              Flip
            </button>
            <button
              type="button"
              onClick={capture}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-white/90"
            >
              <Camera size={16} />
              Capture
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void openCamera("environment", true)}
          disabled={opening}
          className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition-colors hover:border-slate-300 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-70 dark:border-white/10 dark:bg-white/4 dark:hover:border-white/15 dark:hover:bg-white/6"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-white/70">
            {opening ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
          </span>
          <span className="text-sm font-medium text-slate-700 dark:text-white/80">
            {opening ? "Opening camera…" : "Open camera"}
          </span>
          <span className="text-xs text-slate-400 dark:text-white/35">
            Take one photo of the item. Gallery uploads are not available.
          </span>
        </button>
      )}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <p className="text-xs leading-relaxed text-slate-500 dark:text-white/50">
        {required
          ? "A live photo is required before this return can be submitted."
          : "A live photo is optional in this environment, so you can continue and test the rest of the return."}
      </p>
    </div>
  );
}
