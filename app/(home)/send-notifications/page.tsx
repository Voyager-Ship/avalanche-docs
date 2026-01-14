import { getServerSession } from "next-auth";
import { AuthOptions } from "@/lib/auth/authOptions";
import SendNotificationsForm from "@/components/notification/send-notifications-form";

export default async function Page() {
  const session = await getServerSession(AuthOptions);

  const accessToken = (session as any)?.accessToken ?? null;

  return <SendNotificationsForm jwtToken={accessToken} />;
}