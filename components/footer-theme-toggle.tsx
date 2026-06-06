'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'

/** Matches `NavItem` inactive styling in the app footer. */
export function FooterThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  const baseClass = cn(
    'flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[10px] font-medium transition-colors',
    'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
  )

  if (!mounted) {
    return (
      <div className={baseClass} aria-hidden>
        <span className='size-5' />
        Tema
      </div>
    )
  }


  return (
    <button
      type='button'
      className={baseClass}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {isDark ? (
        <Sun className='size-5' strokeWidth={2} />
      ) : (
        <Moon className='size-5' strokeWidth={2} />
      )}
      Tema
    </button>
  )
}
