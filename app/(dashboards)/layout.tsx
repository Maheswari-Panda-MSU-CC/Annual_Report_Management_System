// app/(dashboard)/layout.tsx
import { DashboardLayout } from "@/components/dashboard-layout";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
