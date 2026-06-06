'use client'

import { useActionState } from 'react'
import { AlertCircle } from 'lucide-react'

import { loginAction, type LoginState } from '@/lib/auth/login-action'
import { ThemeToggle } from '@/components/theme-toggle'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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

const initial: LoginState = { ok: true }

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial)

  return (
    <Card className='border-border/50 bg-card/80 w-full max-w-md shadow-2xl ring-1 ring-white/10 backdrop-blur-md dark:ring-white/5'>
      <CardHeader className='relative space-y-1'>
        <div className='absolute top-4 right-4'>
          <ThemeToggle />
        </div>
        <CardTitle className='text-xl tracking-tight sm:text-2xl'>Login | KeyPET</CardTitle>

      </CardHeader>
      <CardContent className='space-y-4'>
        {!state.ok ? (
          <Alert variant='destructive'>
            <AlertCircle className='size-4' />
            <AlertTitle>Não foi possível realizar o login</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='email'>Email</FieldLabel>
              <FieldContent>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor='password'>Senha</FieldLabel>
              <FieldContent>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  required
                />
              </FieldContent>
            </Field>
            <Button type='submit' className='w-full' size='lg' disabled={pending}>
              {pending ? 'Entrando…' : 'Entrar'}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className='flex justify-center border-t border-border/50 pt-6'>
        <FieldDescription className='text-center text-pretty'>
          Ainda sem acesso? Entre em contato com um administrador para criar sua conta!
        </FieldDescription>
      </CardFooter>
    </Card>
  )
}
