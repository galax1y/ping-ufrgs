'use client'

import { ChangeEvent, useState } from 'react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export function InputQRCode() {
  const [url, setUrl] = useState<string>('')
  const [displayedUrl, setDisplayedUrl] = useState<string>('')

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }

  const handleDisplayUrl = () => {
    const result = z.url().safeParse(url)

    if (result.error) {
      toast.error('Please insert a valid URL')
      return
    }

    setDisplayedUrl(result.data)
  }

  return (
    <Card className='border-border/50 w-full max-w-lg shadow-lg'>
      <CardHeader>
        <CardTitle>QR code</CardTitle>
        <CardDescription>
          Enter a URL to generate a scannable QR code.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className='space-y-6 pt-6'>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor='qr-url'>URL</FieldLabel>
            <FieldContent>
              <div className='flex flex-col gap-2 sm:flex-row sm:items-stretch'>
                <Input
                  id='qr-url'
                  value={url}
                  onChange={handleUrlChange}
                  placeholder='https://example.com'
                  className='placeholder:text-sm'
                />
                <Button
                  type='button'
                  variant='secondary'
                  onClick={handleDisplayUrl}
                  className='shrink-0 sm:w-auto'
                >
                  Generate
                </Button>
              </div>
              <FieldDescription>
                The QR encodes exactly the URL you confirm with Generate.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>

        {displayedUrl ? (
          <div className='flex justify-center'>
            <div className='border-border bg-background rounded-xl border p-4 shadow-sm'>
              <QRCode className='h-full w-full' value={displayedUrl} />
            </div>
          </div>
        ) : null}
      </CardContent>
      {!!displayedUrl && displayedUrl !== url ? (
        <CardFooter className='border-t'>
          <p className='text-muted-foreground text-sm'>
            QR code does not match the current input — click Generate again to
            update.
          </p>
        </CardFooter>
      ) : null}
    </Card>
  )
}
