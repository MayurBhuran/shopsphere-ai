
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, LoaderCircle } from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        const savedUser = localStorage.getItem(
          "shopsphere-current-user"
        );

        const currentUser = savedUser
          ? JSON.parse(savedUser)
          : null;

        if (currentUser?.role === "admin") {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.replace("/login");
        }
      } catch (error) {
        console.error("Admin authorization error:", error);
        setIsAuthorized(false);
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    };

    checkAdminAccess();
  }, [router, pathname]);

  if (checking) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <LoaderCircle className="animate-spin text-blue-600" size={32} />
        <p className="text-gray-500">Verifying administrator access...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <ShieldAlert size={40} className="text-red-500" />
        <h2 className="text-xl font-bold text-gray-800">
          Access Denied
        </h2>
        <p className="text-gray-500">
          Administrator access is required.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
