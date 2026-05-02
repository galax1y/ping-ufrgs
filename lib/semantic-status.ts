/**
 * Reusable Tailwind class groups for status surfaces (room/key, badges, etc.).
 * success = favorable / available, caution = attention / blocked, destructive = error / missing.
 * Light mode uses saturated foreground hues on soft tinted surfaces; dark mode keeps luminous text.
 */

export const SEMANTIC_STATUS_TONES = ['success', 'caution', 'destructive'] as const

export type SemanticStatusTone = (typeof SEMANTIC_STATUS_TONES)[number]

export type SemanticStatusClasses = {
  /** Panel border + background wash */
  surfaceCard: string
  /** Decorative blur orb behind content */
  glow: string
  /** Icon in a rounded tile (ring + fill) */
  iconTile: string
  /** Large primary stat (e.g. Open / Closed) */
  emphasis: string
  /** Softer large title (e.g. key holder name) */
  titleSoft: string
  /** Secondary line under title */
  subtitleSoft: string
}

export const SEMANTIC_STATUS: Record<SemanticStatusTone, SemanticStatusClasses> =
  {
    success: {
      surfaceCard:
        'border-emerald-200/90 bg-emerald-50/90 dark:border-emerald-500/40 dark:bg-emerald-500/[0.12]',
      glow: 'bg-emerald-400/25 dark:bg-emerald-500/15',
      iconTile:
        'bg-emerald-100 text-emerald-800 ring-emerald-500/35 dark:bg-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-500/35',
      emphasis:
        'text-emerald-900 dark:text-emerald-400',
      titleSoft:
        'text-emerald-950 dark:text-emerald-100',
      subtitleSoft:
        'text-emerald-800/90 dark:text-emerald-200/80',
    },
    caution: {
      surfaceCard:
        'border-amber-200/90 bg-amber-50/90 dark:border-amber-500/40 dark:bg-amber-500/[0.1]',
      glow: 'bg-amber-400/25 dark:bg-amber-500/15',
      iconTile:
        'bg-amber-100 text-amber-900 ring-amber-500/40 dark:bg-amber-500/20 dark:text-amber-400 dark:ring-amber-500/35',
      emphasis:
        'text-amber-950 dark:text-amber-400',
      titleSoft:
        'text-amber-950 dark:text-amber-100',
      subtitleSoft:
        'text-amber-900/85 dark:text-amber-200/80',
    },
    destructive: {
      surfaceCard:
        'border-destructive/30 bg-destructive/[0.06] dark:border-destructive/40 dark:bg-destructive/[0.08]',
      glow: 'bg-destructive/20 dark:bg-destructive/15',
      iconTile:
        'bg-destructive/10 text-destructive ring-destructive/35 dark:bg-destructive/15 dark:text-destructive dark:ring-destructive/30',
      emphasis: 'text-destructive',
      titleSoft: 'text-destructive',
      subtitleSoft: 'text-destructive/85 dark:text-destructive/80',
    },
  }

export function semanticStatus(tone: SemanticStatusTone): SemanticStatusClasses {
  return SEMANTIC_STATUS[tone]
}
