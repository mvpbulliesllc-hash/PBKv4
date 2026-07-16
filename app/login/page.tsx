import { redirect } from "next/navigation"

// No auth in demo mode — redirect straight to the app.
export default function LoginPage() {
  redirect("/")
}
