import TokenManagement from "@/components/toolbox/console/utilities/data-api-keys/TokenManagement";
import { getAuthSession } from "@/lib/auth/authSession";
import { redirect } from "next/navigation";
import { createGlacierJWT } from "@/lib/glacier-jwt";

export default async function Page() {
  const session = await getAuthSession();

  // If not authenticated, the middleware and AutoLoginModalTrigger will handle showing the login modal
  // This page will still render but TokenManagement will need the session
  if (!session) {
    // Return a placeholder - the login modal will be shown by AutoLoginModalTrigger
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Generate asymmetric JWT for Glacier API
  const glacierJwt = await createGlacierJWT({
    sub: session.user.id,
    iss: "https://build.avax.network/",
    email: session.user.email!,
  });

  const DATA_API_ENDPOINT = process.env.VERCEL_ENV === "production" ? 'https://data-api.avax.network/v1' : 'https://data-api-dev.avax.network/v1';


  // Pass authenticated user data to the component
  return (
    <TokenManagement
      glacierJwt={glacierJwt}
      endpoint={DATA_API_ENDPOINT}
    />
  );
}
