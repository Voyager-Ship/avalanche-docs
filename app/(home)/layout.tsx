"use client";

import type { ReactNode } from "react";
import { Footer } from "@/components/navigation/footer";
import { baseOptions } from "@/app/layout.config";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { LayoutWrapper } from "@/app/layout-wrapper.client";
import { NavbarDropdownInjector } from "@/components/navigation/navbar-dropdown-injector";
import { WalletProvider } from "@/components/toolbox/providers/WalletProvider";
import { Terms } from "@/components/login/terms";
import { LoginModalWrapper } from "@/components/login/LoginModalWrapper";
import { AutoLoginModalTrigger } from "@/components/login/AutoLoginModalTrigger";

export default function Layout({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <AutoLoginModalTrigger />
      </Suspense>
      <LoginModalWrapper />
      <NavbarDropdownInjector />
      <WalletProvider>
        <LayoutWrapper baseOptions={baseOptions}>
          {children}
          <Footer />
        </LayoutWrapper>
      </WalletProvider>
    </SessionProvider>
  );
}

