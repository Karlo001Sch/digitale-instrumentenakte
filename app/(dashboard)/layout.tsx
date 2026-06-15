import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { requireOrganization } from '@/lib/permissions'
import { ensureUserProfile } from '@/lib/auth'
import { ToastProvider } from '@/components/ui/toast-context'
import { getOrgSettings } from '@/lib/settings-cache'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const membership = await requireOrganization()
  await ensureUserProfile(membership.userId, membership.user.email)

  const { settings } = await getOrgSettings()

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          appName={settings?.appName ?? membership.organization.name}
          logoUrl={settings?.logoUrl}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar
            organizationName={settings?.appName ?? membership.organization.name}
            userEmail={membership.user.email}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  )
}
