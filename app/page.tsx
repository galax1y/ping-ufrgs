import { getUsers } from '@/actions/get-users'
import { InputQRCode } from '@/components/input-qrcode'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Home() {
  const users = await getUsers()

  console.log(users)

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <div className='container px-6'>
        <section className='flex flex-col items-center justify-start'>
          <h1 className='text-primary mb-6 text-3xl'>QR Code experiment</h1>
          <InputQRCode />
        </section>

        <Button className='w-full' asChild>
          <Link href={'/check-in'}>Check in</Link>
        </Button>
      </div>
    </div>
  )
}
