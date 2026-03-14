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
    <div className='flex min-h-screen flex-col items-center justify-center bg-red-500'>
      <div className='container bg-blue-500'>
        <pre className='overflow-x-scroll'>
          {JSON.stringify(props, null, 2)}
        </pre>
      </div>
    </div>
  )
}
