"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Header olmasın istediğin sayfalar
  const hideHeaderRoutes = [
    "/login",
    "/register",
    "/forgot-password",
  ];

  const hideHeader = hideHeaderRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <>
      {!hideHeader && <Header />}
      <main>{children}</main>
      {!hideHeader && <Footer />}
    </>
  );
}
