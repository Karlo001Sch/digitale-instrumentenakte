import { LoginForm } from '@/components/auth/LoginForm'
import { getOrgSettings } from '@/lib/settings-cache'

async function getSettings() {
  const { settings, orgName } = await getOrgSettings()
  return { settings, orgName }
}

export default async function LoginPage() {
  const { settings, orgName } = await getSettings()

  return (
    <LoginForm
      appName={settings?.appName ?? orgName ?? 'Instrument Lifecycle Suite'}
      logoUrl={settings?.logoUrl}
      loginBgColor={settings?.loginBgColor ?? '#f3f4f6'}
    />
  )
}
