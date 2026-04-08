"use client";

import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center text-[#7a7a85] text-sm">
      Loading dashboard…
    </div>
  ),
});

export default function ClientDashboard({ data }: { data: Parameters<typeof import("@/components/Dashboard").default>[0]["data"] }) {
  return <Dashboard data={data} />;
}
