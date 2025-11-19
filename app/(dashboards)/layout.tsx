// app/(dashboard)/layout.tsx
import { DashboardLayout } from "@/components/dashboard-layout";
import { Suspense } from "react";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </DashboardLayout>
  );
}
