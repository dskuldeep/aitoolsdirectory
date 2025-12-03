import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="ml-64 flex flex-1 flex-col">
        <AdminHeader user={user} />
        <main className="mt-16 flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  )
}

