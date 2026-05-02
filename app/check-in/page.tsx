'use client'

import { ThumbmarkProvider, useThumbmark } from '@thumbmarkjs/react'

import { ThemeToggle } from '@/components/theme-toggle'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export default function CheckInPage() {
  return (
    <ThumbmarkProvider>
      <CheckInContent />
    </ThumbmarkProvider>
  )
}

function CheckInContent() {
  const { isLoading, ...props } = useThumbmark()

  return (
    <div className='bg-app-gradient flex min-h-screen flex-col items-center justify-center p-4'>
      <Card className='border-border/50 bg-card/80 w-full max-w-2xl shadow-2xl ring-1 ring-white/10 backdrop-blur-md dark:ring-white/5'>
        <CardHeader className='relative'>
          <div className='absolute top-0 right-0'>
            <ThemeToggle />
          </div>
          <CardTitle className='text-xl tracking-tight pr-12'>Check-in</CardTitle>
          <CardDescription>
            Device fingerprint payload from Thumbmark (experiment).
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className='pt-6'>
          {isLoading ? (
            <div className='space-y-3'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-32 w-full' />
            </div>
          ) : (
            <ScrollArea className='max-h-[min(24rem,50vh)] rounded-lg border border-border/60'>
              <pre className='p-4 text-xs break-words whitespace-pre-wrap'>
                {JSON.stringify(props, null, 2)}
              </pre>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
