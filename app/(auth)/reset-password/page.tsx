import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string; email?: string }>;
}) {
  const params = await searchParams;

  return (
    <ResetPasswordForm
      token={params.token?.trim() ?? ""}
      email={params.email?.trim() ?? ""}
      tokenError={params.error === "INVALID_TOKEN"}
    />
  );
}
