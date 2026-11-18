import type { Metadata } from "next";
import { NabdaWorkspace } from "@/components/NabdaWorkspace";

export const metadata: Metadata = { title: "مساحة العمل | نبضة NABDA AI" };

export default function WorkspacePage() {
  return <NabdaWorkspace />;
}
