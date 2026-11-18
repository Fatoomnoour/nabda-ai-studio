import "@/styles/landing.css";
import type { Metadata } from "next";
import { TeamPage } from "@/components/landing/TeamPage";

export const metadata: Metadata = {
  title: "فريق نبضة | NABDA AI Team",
  description: "تعرّف على الفريق خلف نبضة NABDA AI — المنتج والتدريب، التقنية، والتفاعل والتلعيب.",
};

export default function TeamRoutePage() {
  return <TeamPage />;
}
