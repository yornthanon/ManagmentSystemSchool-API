import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {KeyRound, Plus, Search, ShieldCheck, Trash2} from 'lucide-react';
import {toast} from 'sonner';
import {usersApi} from '@/src/api/users';
import {Avatar} from '@/src/components/ui/Avatar';
import {ConfirmDialog} from '@/src/components/ui/ConfirmDialog';
import {EmptyState} from '@/src/components/ui/EmptyState';
import {Modal} from '@/src/components/ui/Modal';
import {Pagination} from '@/src/components/ui/Pagination';
import {StatusText} from '@/src/components/ui/StatusText';
import {TableSkeleton} from '@/src/components/ui/TableSkeleton';
import {parseApiError} from '@/src/lib/errorParser';
import type {Role, User} from '@/src/types';

const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
});

type CreateUserValues = z.infer<typeof createUserSchema>;

export function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleting, setDeleting] = useState<User | null>(null);

  const {data, isLoading} = useQuery({
    queryKey: ['users', {page, search, roleFilter}],
    queryFn: () =>
      usersApi.list({
        page,
        size: 12,
        search: search || undefined,
        role: roleFilter || undefined,
      }),
  });

  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      password: '',
      role: 'TEACHER',
    },
  });

  const createMutation = useMutation({
    mutationFn: (vals: CreateUserValues) => usersApi.create(vals),
    onSuccess: () => {
      toast.success('User account created');
      queryClient.invalidateQueries({queryKey: ['users']});
      setCreateOpen(false);
    },
    onError: (err) => {
      const parsed = parseApiError(err, 'Failed to create user');
      toast.error(parsed.message);
      Object.entries(parsed.details).forEach(([field, msg]) => {
        if (field in form.getValues()) {
          form.setError(field as keyof CreateUserValues, {message: msg});
        }
      });
    },
  });

  const resetPwdMutation = useMutation({
    mutationFn: () => usersApi.changePassword(resetTarget!.id, newPassword),
    onSuccess: () => {
      toast.success('Password reset successfully');
      setResetTarget(null);
      setNewPassword('');
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to reset password').message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({queryKey: ['users']});
      setDeleting(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to delete user').message);
    },
  });

  const rows = data?.content || [];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF1FF] text-[#4F5DF5] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-sm text-slate-900">
                User Accounts & Roles
              </h2>
              <p className="text-xs text-slate-500">
                Create and manage Admin, Teacher, Student, and Parent login credentials
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              form.reset({username: '', fullName: '', email: '', password: '', role: 'TEACHER'});
              setCreateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Create User
          </button>
        </div>

        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <select
            aria-label="Filter by role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg"
          >
            <option value="">All roles</option>
            {(['ADMIN', 'TEACHER', 'STUDENT'] as Role[]).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search user..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No users found"
            description="Create accounts for teachers, students, parents, or additional administrators."
            actionLabel="Create User"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FB] border-b border-slate-100 text-[12px] font-medium text-slate-500">
                    <th className="py-3 pl-5 pr-3">User</th>
                    <th className="py-3 px-3">Username</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 pl-3 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {rows.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={u.fullName} indexOrRole={u.role} />
                          <div>
                            <div className="font-medium text-slate-900">{u.fullName}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-600">{u.username}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">{u.role}</td>
                      <td className="py-3 px-3">
                        <StatusText status={u.active === false ? 'INACTIVE' : 'ACTIVE'} />
                      </td>
                      <td className="py-3 pl-3 pr-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setResetTarget(u);
                              setNewPassword('');
                            }}
                            title="Reset password"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F5DF5] hover:bg-[#EEF1FF]"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(u)}
                            title="Delete user"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={data?.number ?? 0}
              totalPages={data?.totalPages ?? 1}
              totalElements={data?.totalElements ?? 0}
              size={data?.size ?? 12}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create User Account"
        description="Assign an explicit role and initial sign-in password."
      >
        <form
          onSubmit={form.handleSubmit((vals) => createMutation.mutate(vals))}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                {...form.register('fullName')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
              {form.formState.errors.fullName ? (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.fullName.message}
                </p>
              ) : null}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                {...form.register('username')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
              {form.formState.errors.username ? (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.username.message}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              {...form.register('email')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
            {form.formState.errors.email ? (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
              <select
                {...form.register('role')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              >
                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Initial Password
              </label>
              <input
                type="password"
                {...form.register('password')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
              {form.formState.errors.password ? (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(resetTarget)}
        onClose={() => setResetTarget(null)}
        title={`Reset Password — ${resetTarget?.fullName}`}
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setResetTarget(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={newPassword.length < 6 || resetPwdMutation.isPending}
              onClick={() => resetPwdMutation.mutate()}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg disabled:opacity-50"
            >
              {resetPwdMutation.isPending ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete User Account"
        message={`Delete account for ${deleting?.fullName} (${deleting?.username})?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
