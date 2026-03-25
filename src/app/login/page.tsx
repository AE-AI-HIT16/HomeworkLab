import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; denied?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const accessDenied = params.error === "AccessDenied" || params.denied === "true";
  const deniedUser = params.denied === "true" ? "unknown" : undefined;

  return <LoginClient accessDenied={accessDenied} deniedUser={deniedUser} />;
}
