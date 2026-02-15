"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Tonibot from "./workspace/Tonibot";

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
    "/workspace"
  ];
    const hideComponentRoutes = [
    "/login",
    "/register",
    "/forgot-password",
  ];

  const hideHeader = hideHeaderRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const hideCompenent = hideComponentRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <>
      {!hideHeader && <Header />}
      <main>{children}</main>
      {!hideCompenent && <Footer />}   
      {!hideCompenent && <Tonibot />}   

    </>
  );
}
