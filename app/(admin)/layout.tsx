import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { AdminLayoutClient } from '@/components/admin/admin-layout-client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>
}
