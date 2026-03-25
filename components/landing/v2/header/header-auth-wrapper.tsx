import Header from "@/components/Header";
import { getServerSession } from "@/lib/get-server-session";

export default async function HeaderAuthWrapper() {
  const session = await getServerSession();

  return <Header userSession={session} />;
}
