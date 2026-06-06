'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import { createMemberAction } from '@/actions/admin/members/create-member'
import { type AdminMemberRow } from '@/actions/admin/members/list-members'
import { setMemberDisabledAction } from '@/actions/admin/members/set-member-disabled'
import { updateMemberAction } from '@/actions/admin/members/update-member'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const roles = [
  { value: 'member', label: 'Membro' },
  { value: 'assistant', label: 'Secretaria' },
  { value: 'admin', label: 'Administrador' },
] as const

function roleLabel(role: AdminMemberRow['role']) {
  return roles.find((r) => r.value === role)?.label ?? role
}

function roleBadgeVariant(role: AdminMemberRow['role']) {
  if (role === 'admin') return 'default' as const
  if (role === 'assistant') return 'secondary' as const
  return 'outline' as const
}

function RoleSelectField({
  name,
  defaultValue,
}: {
  name: string
  defaultValue: string
}) {
  const [value, setValue] = useState(defaultValue)
  return (
    <>
      <input type='hidden' name={name} value={value} readOnly />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='Cargo' />
        </SelectTrigger>
        <SelectContent>
          {roles.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}

export function MembersAdminClient({
  members,
  currentUserId,
}: {
  members: AdminMemberRow[]
  currentUserId: string
}) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [createFormKey, setCreateFormKey] = useState(0)
  const [editing, setEditing] = useState<AdminMemberRow | null>(null)
  const [disableTarget, setDisableTarget] = useState<AdminMemberRow | null>(null)
  const [disablePending, setDisablePending] = useState(false)

  const activeMembers = useMemo(
    () => members.filter((m) => !m.disabled),
    [members],
  )
  const disabledMembers = useMemo(
    () => members.filter((m) => m.disabled),
    [members],
  )

  return (
    <div className='space-y-6'>
      <Card className='border-border/50 shadow-lg'>
        <CardHeader className='space-y-4 sm:flex sm:flex-row sm:items-start sm:justify-between sm:space-y-0'>
          <div className='space-y-1'>
            <CardTitle>Membros</CardTitle>
            <CardDescription>
              {activeMembers.length} ativos
              {disabledMembers.length > 0
                ? ` · ${disabledMembers.length} inativos`
                : ''}
            </CardDescription>
          </div>
          <Button
            type='button'
            className='shrink-0 gap-1.5'
            onClick={() => setCreateOpen(true)}
          >
            <PlusIcon className='size-4' />
            Adicionar membro
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className='pt-6'>
          <Tabs defaultValue='active' className='w-full gap-4'>
            <TabsList className='h-auto w-full justify-start sm:w-auto'>
              <TabsTrigger value='active' className='text-xs sm:text-sm'>
                Ativos ({activeMembers.length})
              </TabsTrigger>
              <TabsTrigger value='disabled' className='text-xs sm:text-sm'>
                Inativos ({disabledMembers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value='active' className='mt-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Chave</TableHead>
                    <TableHead className='text-right'>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeMembers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className='text-muted-foreground py-8 text-center text-sm'
                      >
                        Sem membros ativos
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeMembers.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className='font-medium'>{m.name}</TableCell>
                        <TableCell className='text-muted-foreground max-w-[200px] truncate'>
                          {m.email}
                        </TableCell>
                        <TableCell>{m.enrollmentNumber}</TableCell>
                        <TableCell>
                          <Badge
                            variant={roleBadgeVariant(m.role)}
                          >
                            {roleLabel(m.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {m.holdsKey ? (
                            <Badge variant='default' className='font-normal'>
                              Tem posse
                            </Badge>
                          ) : (
                            <span className='text-muted-foreground'>—</span>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex flex-wrap justify-end gap-2'>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => setEditing(m)}
                            >
                              Editar
                            </Button>
                            <Button
                              type='button'
                              variant='secondary'
                              size='sm'
                              disabled={
                                m.id === currentUserId || m.holdsKey
                              }
                              title={
                                m.holdsKey
                                  ? 'Transfira ou restaure a posse da chave antes de desabilitar'
                                  : undefined
                              }
                              onClick={() => setDisableTarget(m)}
                            >
                              Desabilitar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value='disabled' className='mt-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Chave</TableHead>
                    <TableHead className='text-right'>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disabledMembers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className='text-muted-foreground py-8 text-center text-sm'
                      >
                        Sem membros inativos
                      </TableCell>
                    </TableRow>
                  ) : (
                    disabledMembers.map((m) => (
                      <TableRow key={m.id} className='opacity-90'>
                        <TableCell className='font-medium'>{m.name}</TableCell>
                        <TableCell className='text-muted-foreground max-w-[200px] truncate'>
                          {m.email}
                        </TableCell>
                        <TableCell>{m.enrollmentNumber}</TableCell>
                        <TableCell>
                          <Badge
                            variant={roleBadgeVariant(m.role)}
                          >
                            {roleLabel(m.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {m.holdsKey ? (
                            <Badge variant='outline' className='font-normal'>
                              Tem posse
                            </Badge>
                          ) : (
                            <span className='text-muted-foreground'>—</span>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex flex-wrap justify-end gap-2'>
                            <Button
                              type='button'
                              variant='default'
                              size='sm'
                              onClick={async () => {
                                const r = await setMemberDisabledAction(
                                  m.id,
                                  false,
                                )
                                if (r.ok) {
                                  toast.success('Conta reativada')
                                  router.refresh()
                                } else toast.error(r.error)
                              }}
                            >
                              Habilitar
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => setEditing(m)}
                            >
                              Editar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (open) setCreateFormKey((k) => k + 1)
        }}
      >
        <DialogContent className='gap-0 p-0 sm:max-w-md'>
          <DialogHeader className='p-4 pb-2'>
            <DialogTitle>Adicionar membro</DialogTitle>
            <DialogDescription>
              A senha definida aqui será usada no primeiro acesso. O membro pode
              alterá-la depois de entrar.
            </DialogDescription>
          </DialogHeader>
          <form
            key={createFormKey}
            className='space-y-4 px-4 pb-4'
            action={async (fd) => {
              const r = await createMemberAction(fd)
              if (r.ok) {
                toast.success('Membro criado')
                setCreateOpen(false)
                router.refresh()
              } else toast.error(r.error)
            }}
          >
            <FieldGroup className='gap-4'>
              <Field>
                <FieldLabel>Nome</FieldLabel>
                <FieldContent>
                  <Input name='name' required autoComplete='off' />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <FieldContent>
                  <Input name='email' type='email' required />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Matrícula</FieldLabel>
                <FieldContent>
                  <Input name='enrollmentNumber' required autoComplete='off' />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Cargo</FieldLabel>
                <FieldContent>
                  <RoleSelectField name='role' defaultValue='member' />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Senha</FieldLabel>
                <FieldContent>
                  <Input
                    name='password'
                    type='password'
                    required
                    minLength={8}
                    autoComplete='new-password'
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
            <DialogFooter className='mt-4 border-t bg-muted/40 px-0 pt-4 sm:justify-end'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setCreateOpen(false)}
              >
                Cancelar
              </Button>
              <Button type='submit'>Criar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent className='gap-0 p-0 sm:max-w-md'>
          <DialogHeader className='p-4 pb-2'>
            <DialogTitle>Editar membro</DialogTitle>
            <DialogDescription>
              Atualize perfil, cargo ou defina uma nova senha. Deixe a senha em
              branco para manter a atual.
              {editing?.disabled ? (
                <>
                  {' '}
                  Esta conta está <strong>desabilitada</strong> — use Habilitar na
                  aba Inativos para permitir o acesso novamente.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <form
              key={editing.id}
              className='space-y-4 px-4 pb-4'
              action={async (fd) => {
                const r = await updateMemberAction(fd)
                if (r.ok) {
                  toast.success('Membro atualizado')
                  setEditing(null)
                  router.refresh()
                } else toast.error(r.error)
              }}
            >
              <input type='hidden' name='id' value={editing.id} />
              <FieldGroup className='gap-4'>
                <Field>
                  <FieldLabel>Nome</FieldLabel>
                  <FieldContent>
                    <Input
                      name='name'
                      required
                      defaultValue={editing.name}
                      autoComplete='off'
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <FieldContent>
                    <Input
                      name='email'
                      type='email'
                      required
                      defaultValue={editing.email}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Matrícula</FieldLabel>
                  <FieldContent>
                    <Input
                      name='enrollmentNumber'
                      required
                      defaultValue={editing.enrollmentNumber}
                      autoComplete='off'
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Cargo</FieldLabel>
                  <FieldContent>
                    <RoleSelectField name='role' defaultValue={editing.role} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Nova senha (opcional)</FieldLabel>
                  <FieldContent>
                    <Input
                      name='password'
                      type='password'
                      minLength={8}
                      placeholder='Deixe em branco para manter a atual'
                      autoComplete='new-password'
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>
              <DialogFooter className='mt-4 border-t bg-muted/40 px-0 pt-4 sm:justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setEditing(null)}
                >
                  Cancelar
                </Button>
                <Button type='submit'>Salvar</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!disableTarget}
        onOpenChange={(open) => {
          if (!open) setDisableTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desabilitar esta conta?</AlertDialogTitle>
            <AlertDialogDescription>
              {disableTarget
                ? `${disableTarget.name} não poderá mais entrar. Os dados permanecem no sistema; você pode reativar a conta na aba Inativos.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disablePending}>Cancelar</AlertDialogCancel>
            <Button
              variant='secondary'
              disabled={disablePending}
              onClick={async () => {
                if (!disableTarget) return
                setDisablePending(true)
                try {
                  const r = await setMemberDisabledAction(disableTarget.id, true)
                  if (r.ok) {
                    toast.success('Conta desabilitada')
                    setDisableTarget(null)
                    router.refresh()
                  } else toast.error(r.error)
                } finally {
                  setDisablePending(false)
                }
              }}
            >
              Desabilitar conta
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
