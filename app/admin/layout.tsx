import { AppHeader } from '@/components/app-header'

export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <AppHeader />
      <div className='from-background via-background to-muted/25 relative min-h-[calc(100dvh-8.5rem)] bg-gradient-to-b'>
        <div className='container mx-auto max-w-4xl px-4 py-8 md:py-10'>
          {children}
        </div>
      </div>
    </>
  )
}
