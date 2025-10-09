import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to the learn module dashboard
  redirect("/learn")
}
