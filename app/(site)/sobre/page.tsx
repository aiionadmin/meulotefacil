import { redirect } from "next/navigation";

/** @deprecated use /quem-somos — redirect também em next.config */
export default function SobrePage() {
  redirect("/quem-somos");
}
