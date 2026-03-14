'use client'

import { ThumbmarkProvider, useThumbmark } from '@thumbmarkjs/react'

export default function CheckInPage() {
  return (
    <ThumbmarkProvider>
      <CheckInComponent />
    </ThumbmarkProvider>
  )
}

const CheckInComponent = () => {
  const { isLoading, ...props } = useThumbmark()

  if (isLoading) {
    return <div>Carregando</div>
  }

  return (
    <div className='flex flex-col items-center justify-center gap-2'>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  )
}
