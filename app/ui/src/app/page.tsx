import { redirect } from "next/navigation"

export default async function HomePage() {
  redirect("/learn")
  return null // Add return statement to satisfy TypeScript
}