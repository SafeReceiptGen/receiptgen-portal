import { headers } from "next/headers";
import { returnsApi, ApiRequestError } from "@/lib/api";
import { mapPublicReturnBundleToReturnRequest } from "@/lib/return-mappers";
import {
  originForPortalHost,
  portalPublicOrigin,
} from "@/lib/portal-public-url";
import ReturnStatusClient from "@/components/returns/return-status-client";

export default async function ReturnStatusServerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id: returnId } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <ReturnStatusClient returnData={undefined} returnId={returnId} />
    );
  }

  try {
    const bundle = await returnsApi.getPublic(returnId, token);
    const returnData = mapPublicReturnBundleToReturnRequest(bundle, token);
    const headerList = await headers();
    const requestOrigin =
      originForPortalHost(
        headerList.get("x-forwarded-host") ?? headerList.get("host"),
        headerList.get("x-forwarded-proto"),
      ) ?? portalPublicOrigin();
    const returnTrackingUrl = `${requestOrigin}/return/${returnId}?token=${encodeURIComponent(token)}`;
    return (
      <ReturnStatusClient
        returnData={returnData}
        returnId={returnId}
        returnTrackingUrl={returnTrackingUrl}
      />
    );
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return (
        <ReturnStatusClient returnData={undefined} returnId={returnId} />
      );
    }
    throw error;
  }
}
