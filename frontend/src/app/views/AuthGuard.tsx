import { useAuth } from "@clerk/clerk-react";
import { ReactNode } from "react";
import { AuthPage } from "./AuthPage";
import { AppLayoutSkeleton } from "@shared/components/PageSkeleton";

export function AuthGuard({
  children,
}: {
  children: (getToken: () => Promise<string | null>) => ReactNode;
}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <AppLayoutSkeleton />;
  }

  return isSignedIn ? <>{children(getToken)}</> : <AuthPage />;
}
