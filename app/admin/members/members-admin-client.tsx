'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { createMemberAction } from '@/actions/admin/members/create-member'
import { deleteMemberAction } from '@/actions/admin/members/delete-member'
import { type AdminMemberRow } from '@/actions/admin/members/list-members'
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

const roles = [
  { value: 'member', label: 'Member' },
  { value: 'assistant', label: 'Assistant' },
  { value: 'admin', label: 'Admin' },
] as const

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
          <SelectValue placeholder='Role' />
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
  const [editing, setEditing] = useState<AdminMemberRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminMemberRow | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  return (
    <div className='space-y-8'>
      <Card className='border-border/50 shadow-lg'>
        <CardHeader>
          <CardTitle>Add member</CardTitle>
          <CardDescription>
            New accounts receive the password you set here. Change it after
            first login if needed.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className='pt-6'>
          <form
            className='grid max-w-2xl gap-4 sm:grid-cols-2'
            action={async (fd) => {
              const r = await createMemberAction(fd)
              if (r.ok) {
                toast.success('Member created')
                router.refresh()
              } else toast.error(r.error)
            }}
          >
            <Field className='sm:col-span-2'>
              <FieldLabel>Name</FieldLabel>
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
              <FieldLabel>Enrollment</FieldLabel>
              <FieldContent>
                <Input name='enrollmentNumber' required autoComplete='off' />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Role</FieldLabel>
              <FieldContent>
                <RoleSelectField name='role' defaultValue='member' />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <FieldContent>
                <Input name='password' type='password' required minLength={8} />
              </FieldContent>
            </Field>
            <div className='flex items-end sm:col-span-2'>
              <Button type='submit'>Add member</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className='border-border/50 shadow-lg'>
        <CardHeader>
          <CardTitle>Organization members</CardTitle>
          <CardDescription>
            {members.length} account{members.length === 1 ? '' : 's'} in the
            organization.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className='pt-6'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className='font-medium'>{m.name}</TableCell>
                  <TableCell className='text-muted-foreground max-w-[200px] truncate'>
                    {m.email}
                  </TableCell>
                  <TableCell>{m.enrollmentNumber}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(m.role)} className='capitalize'>
                      {m.role}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex flex-wrap justify-end gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setEditing(m)}
                      >
                        Edit
                      </Button>
                      <Button
                        type='button'
                        variant='destructive'
                        size='sm'
                        disabled={m.id === currentUserId}
                        onClick={() => setDeleteTarget(m)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Edit member</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form
              key={editing.id}
              className='space-y-4'
              action={async (fd) => {
                const r = await updateMemberAction(fd)
                if (r.ok) {
                  toast.success('Member updated')
                  setEditing(null)
                  router.refresh()
                } else toast.error(r.error)
              }}
            >
              <input type='hidden' name='id' value={editing.id} />
              <FieldGroup>
                <Field>
                  <FieldLabel>Name</FieldLabel>
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
                  <FieldLabel>Enrollment</FieldLabel>
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
                  <FieldLabel>Role</FieldLabel>
                  <FieldContent>
                    <RoleSelectField name='role' defaultValue={editing.role} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>New password (optional)</FieldLabel>
                  <FieldContent>
                    <Input
                      name='password'
                      type='password'
                      minLength={8}
                      placeholder='Leave blank to keep current'
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>
              <DialogFooter className='gap-2 sm:gap-0'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button type='submit'>Save</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete member?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will permanently remove ${deleteTarget.name} (${deleteTarget.email}). This cannot be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePending}>Cancel</AlertDialogCancel>
            <Button
              variant='destructive'
              disabled={deletePending}
              onClick={async () => {
                if (!deleteTarget) return
                setDeletePending(true)
                try {
                  const r = await deleteMemberAction(deleteTarget.id)
                  if (r.ok) {
                    toast.success('Member removed')
                    setDeleteTarget(null)
                    router.refresh()
                  } else toast.error(r.error)
                } finally {
                  setDeletePending(false)
                }
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
