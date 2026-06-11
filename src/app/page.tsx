import { redirect } from "next/navigation";
import { ROUTES } from "@/routes";

export default function Home() {
  redirect(ROUTES.LOGIN);
}
