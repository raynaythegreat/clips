'use client'

import { SessionProvider } from 'next-auth/react'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import PWAInstaller from '@/components/PWAInstaller'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ServiceWorkerRegistration />
      {children}
      <PWAInstaller />
    </SessionProvider>
  )
}
