import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      console.log('[AdminLayout] No user found - redirecting to signin')
      redirect('/auth/signin?callbackUrl=/admin')
    }

    console.log('[AdminLayout] User found:', { email: user.email, role: user.role, id: user.id })

    if (user.role !== 'admin' && user.role !== 'editor') {
      console.log('[AdminLayout] User role is not admin/editor:', user.role)
      redirect('/?error=insufficient_permissions')
    }

    console.log('[AdminLayout] Access granted')
  } catch (error) {
    console.error('[AdminLayout] Error:', error)
    redirect('/auth/signin?callbackUrl=/admin')
  }

  return (
    <div className="flex min-h-screen">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64">
        <AdminSidebar />
      </div>
      <div className="flex flex-1 flex-col pl-64">
        {/* Fixed Header */}
        <div className="fixed top-0 left-64 right-0 z-10">
          <AdminHeader user={user} />
        </div>
        {/* Main content, scrolls independently */}
        <main className="flex-1 p-8 pt-24 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

