import { redirect } from 'next/navigation'

export default function Page() {
  // Deprecated — vendor onboarding is handled during signup now
  redirect('/signup?role=vendor')
  return null
}
