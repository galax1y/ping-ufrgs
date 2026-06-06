import { getSession } from '@/lib/auth/session'

export async function AppHeader() {
  const { member } = await getSession()
  if (!member) return null

  return (
    <header className='border-border/60 bg-background/75 supports-backdrop-filter:bg-background/65 sticky top-0 z-40 border-b shadow-sm backdrop-blur-xl'>
      <div className='container flex items-center justify-between gap-3 px-4 py-3'>
        <span className='font-semibold tracking-tight'>KeyPET</span>
        <span className='text-muted-foreground min-w-0 truncate text-sm'>
          {member.name}
        </span>
      </div>
    </header>
  )
}
