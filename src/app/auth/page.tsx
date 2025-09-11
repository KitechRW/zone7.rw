import LoginPage from "@/components/layout/LoginPage";
import Loader from "@/components/misc/Loader";
import { Suspense } from "react";

export default function AuthPage() {
  return (
    <Suspense fallback={<Loader className="h-screen" />}>
      <LoginPage />
    </Suspense>
  );
}
