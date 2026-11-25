import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Pencil, Plus, Search, Trash2, UserCheck} from 'lucide-react';
import {toast} from 'sonner';
import {teachersApi} from '@/src/api/teachers';
import {Avatar} from '@/src/components/ui/Avatar';
import {ConfirmDialog} from '@/src/components/ui/ConfirmDialog';
import {EmptyState} from '@/src/components/ui/EmptyState';
import {Modal} from '@/src/components/ui/Modal';
import {Pagination} from '@/src/components/ui/Pagination';
import {StatusText} from '@/src/components/ui/StatusText';
import {TableSkeleton} from '@/src/components/ui/TableSkeleton';
import {parseApiError} from '@/src/lib/errorParser';
import {formatIsoDate, todayIsoDate} from '@/src/lib/utils';
import type {Teacher} from '@/src/types';

const teacherSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(2, 'Primary subject is required'),
  department: z.string().min(2, 'Department is required'),
  phone: z.string().optional(),
  hireDate: z.string().min(1, 'Hire date is required'),
  status: z.enum(['ACTIVE', 'ON_LEAVE']),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

export function TeachersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [deleting, setDeleting] = useState<Teacher | null>(null);

  const {data, isLoading} = useQuery({
    queryKey: ['teachers', {page, search}],
    queryFn: () =>
      teachersApi.list({
        page,
        size: 12,
        search: search || undefined,
        sort: 'teacherCode,asc',
      }),
  });

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      subject: '',
      department: 'STEM',
      phone: '',
      hireDate: todayIsoDate(),
      status: 'ACTIVE',
    },
  });

  const saveMutation = useMutation({
    mutationFn: (vals: TeacherFormValues) =>
      editing ? teachersApi.update(editing.id, vals) : teachersApi.create(vals),
    onSuccess: () => {
      toast.success(editing ? 'Teacher updated' : 'Teacher added');
      queryClient.invalidateQueries({queryKey: ['teachers']});
      setModalOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      const parsed = parseApiError(err, 'Failed to save teacher');
      toast.error(parsed.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => teachersApi.remove(id),
    onSuccess: () => {
      toast.success('Teacher deleted');
      queryClient.invalidateQueries({queryKey: ['teachers']});
      setDeleting(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to delete teacher').message);
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      username: '',
      fullName: '',
      email: '',
      subject: '',
      department: 'STEM',
      phone: '',
      hireDate: todayIsoDate(),
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    form.reset({
      username: t.username,
      fullName: t.fullName,
      email: t.email,
      subject: t.subject,
      department: t.department,
      phone: t.phone || '',
      hireDate: t.hireDate || todayIsoDate(),
      status: t.status,
    });
    setModalOpen(true);
  };

  const rows = data?.content || [];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF1FF] text-[#4F5DF5] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-sm text-slate-900">Faculty Roster</h2>
              <p className="text-xs text-slate-500">{data?.totalElements ?? 0} faculty members</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Search teacher or subject..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Teacher
            </button>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No teachers found"
            description="Add faculty members to assign subjects and homeroom classrooms."
            actionLabel="Add Teacher"
            onAction={openCreate}
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FB] border-b border-slate-100 text-[12px] font-medium text-slate-500">
                    <th className="py-3 pl-5 pr-3"># ID</th>
                    <th className="py-3 px-3">Teacher</th>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Hire Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 pl-3 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {rows.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-5 pr-3 font-mono text-xs text-slate-500">
                        #{teacher.teacherCode}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={teacher.fullName} indexOrRole={teacher.avatarIndex ?? 1} />
                          <div>
                            <div className="font-medium text-slate-900">{teacher.fullName}</div>
                            <div className="text-xs text-slate-500">{teacher.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">{teacher.subject}</td>
                      <td className="py-3 px-3 text-slate-600">{teacher.department}</td>
                      <td className="py-3 px-3 text-slate-600 tabular-nums">
                        {formatIsoDate(teacher.hireDate)}
                      </td>
                      <td className="py-3 px-3">
                        <StatusText status={teacher.status} />
                      </td>
                      <td className="py-3 pl-3 pr-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(teacher)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F5DF5] hover:bg-[#EEF1FF]"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(teacher)}
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

            <div className="md:hidden divide-y divide-slate-100">
              {rows.map((teacher) => (
                <div key={teacher.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={teacher.fullName}
                      indexOrRole={teacher.avatarIndex ?? 1}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {teacher.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {teacher.subject} · {teacher.department}
                      </p>
                    </div>
                  </div>
                  <StatusText status={teacher.status} />
                </div>
              ))}
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Teacher' : 'Add Teacher'}
      >
        <form
          onSubmit={form.handleSubmit((vals) => saveMutation.mutate(vals))}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                {...form.register('fullName')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
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
                disabled={Boolean(editing)}
                {...form.register('username')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                {...form.register('email')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Primary Subject
              </label>
              <input
                type="text"
                {...form.register('subject')}
                placeholder="Mathematics"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <input
                type="text"
                {...form.register('department')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Hire Date</label>
              <input
                type="date"
                {...form.register('hireDate')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                {...form.register('status')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Teacher'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete Teacher"
        message={`Remove ${deleting?.fullName} from the faculty roster?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
