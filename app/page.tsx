import { getUsers } from '@/actions/get-users'
import { InputQRCode } from '@/components/input-qrcode'

export default async function Home() {
  const users = await getUsers()

  console.log(users)

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <section className='container flex flex-col items-center justify-start'>
        <h1 className='text-primary mb-6 text-4xl'>QR Code experiment</h1>
        <InputQRCode />
      </section>
    </div>
  )
}
