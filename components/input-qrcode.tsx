'use client'

import { ChangeEvent, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import QRCode from 'react-qr-code'
import z from 'zod'
import { toast } from 'sonner'

export function InputQRCode() {
  const [url, setUrl] = useState<string>('')
  const [displayedUrl, setDisplayedUrl] = useState<string>('')

  const handleUrlChange = (
    e: ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    setUrl(e.target.value)
  }

  const handleDisplayUrl = () => {
    const result = z.url().safeParse(url)

    if (result.error) {
      return toast.error('Please insert a valid URL')
    }

    setDisplayedUrl(result.data)
  }

  return (
    <div className='flex flex-col items-center space-y-4 self-center'>
      <div className='flex gap-2'>
        <Input
          value={url}
          onChange={handleUrlChange}
          placeholder='Write an url to generate the QR Code'
          className='w-md'
        />
        <Button
          variant='outline'
          onClick={handleDisplayUrl}
          className='hover:bg-primary'
        >
          Generate
        </Button>
      </div>

      {displayedUrl && displayedUrl.length > 0 && (
        <div className='border-accent w-xl rounded-xl border-2 bg-white p-4 shadow-sm'>
          <QRCode className='h-full w-full' value={displayedUrl} />
        </div>
      )}

      <div className='h-8'>
        {!!displayedUrl && displayedUrl !== url && (
          <p>QR Code is not the same as the one in the Input component</p>
        )}
      </div>
    </div>
  )
}
