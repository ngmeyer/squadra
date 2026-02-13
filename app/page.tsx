import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'

export default async function Home() {
  const user = await getUser()
  
  // If authenticated, redirect to admin dashboard
  if (user) {
    redirect('/admin')
  }
  
  // If not authenticated, redirect to login
  redirect('/login')
}
