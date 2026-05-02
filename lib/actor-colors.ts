const PALETTE = [
  {
    text: 'text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-500 dark:bg-sky-400',
  },
  {
    text: 'text-violet-700 dark:text-violet-300',
    dot: 'bg-violet-500 dark:bg-violet-400',
  },
  {
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  {
    text: 'text-amber-800 dark:text-amber-300',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  {
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
  {
    text: 'text-cyan-700 dark:text-cyan-300',
    dot: 'bg-cyan-500 dark:bg-cyan-400',
  },
  {
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
    dot: 'bg-fuchsia-500 dark:bg-fuchsia-400',
  },
  {
    text: 'text-teal-700 dark:text-teal-300',
    dot: 'bg-teal-500 dark:bg-teal-400',
  },
] as const

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function actorStyle(name: string): (typeof PALETTE)[number] {
  const key = name.trim() || '?'
  return PALETTE[hashString(key) % PALETTE.length]!
}
