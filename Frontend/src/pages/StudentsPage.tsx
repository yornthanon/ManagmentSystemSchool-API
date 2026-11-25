import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  Download,
  GraduationCap,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {toast} from 'sonner';
import {classroomsApi} from '@/src/api/classrooms';
import {studentsApi} from '@/src/api/students';
import {Avatar} from '@/src/components/ui/Avatar';
import {ConfirmDialog} from '@/src/components/ui/ConfirmDialog';
import {EmptyState} from '@/src/components/ui/EmptyState';
import {Modal} from '@/src/components/ui/Modal';
import {Pagination} from '@/src/components/ui/Pagination';
import {StatusText} from '@/src/components/ui/StatusText';
import {TableSkeleton} from '@/src/components/ui/TableSkeleton';
import {useAuth} from '@/src/hooks/useAuth';
import {parseApiError} from '@/src/lib/errorParser';
import {exportToCsv, formatIsoDate, todayIsoDate} from '@/src/lib/utils';
import type {Student} from '@/src/types';

const studentSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  gradeLevel: z.string().min(1, 'Grade level is required'),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export function StudentsPage() {
  const {user} = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);

  const {data: classroomsPage} = useQuery({
    queryKey: ['classrooms', 'dropdown'],
    queryFn: () => classroomsApi.list({size: 50}),
  });

  const {data: studentsPage, isLoading} = useQuery({
    queryKey: ['students', {page, search, classroomId, statusFilter}],
    queryFn: () =>
      studentsApi.list({
        page,
        size: 12,
        search: search || undefined,
        classroomId: classroomId || undefined,
        status: statusFilter || undefined,
        sort: 'studentCode,asc',
      }),
  });

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      gradeLevel: '10',
      guardianName: '',
      guardianPhone: '',
      dateOfBirth: '2010-01-01',
      status: 'ACTIVE',
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: StudentFormValues) => {
      if (editing) {
        return studentsApi.update(editing.id, values);
      }
      return studentsApi.create(values);
    },
    onSuccess: () => {
      toast.success(editing ? 'Student updated' : 'Student created');
      queryClient.invalidateQueries({queryKey: ['students']});
      setModalOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      const parsed = parseApiError(err, 'Failed to save student');
      toast.error(parsed.message);
      Object.entries(parsed.details).forEach(([field, msg]) => {
        if (field in form.getValues()) {
          form.setError(field as keyof StudentFormValues, {message: msg});
        }
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentsApi.remove(id),
    onSuccess: () => {
      toast.success('Student removed');
      queryClient.invalidateQueries({queryKey: ['students']});
      setDeleting(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to delete student').message);
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      username: '',
      fullName: '',
      email: '',
      gradeLevel: '10',
      guardianName: '',
      guardianPhone: '',
      dateOfBirth: '2010-01-01',
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    form.reset({
      username: student.username,
      fullName: student.fullName,
      email: student.email,
      gradeLevel: student.gradeLevel,
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      dateOfBirth: student.dateOfBirth || '2010-01-01',
      status: student.status,
    });
    setModalOpen(true);
  };

  const rows = studentsPage?.content || [];
  const classrooms = classroomsPage?.content || [];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF1FF] text-[#4F5DF5] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-sm text-slate-900">
                Student Directory
              </h2>
              <p className="text-xs text-slate-500">
                {studentsPage?.totalElements ?? 0} total students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                exportToCsv(
                  `students-${todayIsoDate()}.csv`,
                  rows.map((s) => ({
                    Code: s.studentCode,
                    Name: s.fullName,
                    Email: s.email,
                    Grade: s.gradeLevel,
                    Classroom: s.classroomName || 'Unassigned',
                    Status: s.status,
                  })),
                )
              }
              disabled={rows.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

            {isAdmin ? (
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Student
              </button>
            ) : null}
          </div>
        </div>

        {/* Filters */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Filter by classroom"
              value={classroomId}
              onChange={(e) => {
                setClassroomId(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
            >
              <option value="">All classrooms</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search name, code, or email..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No students found"
            description="No student records match your current search or filter criteria."
            actionLabel={isAdmin ? 'Add Student' : undefined}
            onAction={isAdmin ? openCreate : undefined}
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FB] border-b border-slate-100 text-[12px] font-medium text-slate-500">
                    <th className="py-3 pl-5 pr-3"># ID</th>
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Classroom</th>
                    <th className="py-3 px-3">Grade</th>
                    <th className="py-3 px-3">Guardian</th>
                    <th className="py-3 px-3">DOB</th>
                    <th className="py-3 px-3">Status</th>
                    {isAdmin ? <th className="py-3 pl-3 pr-5 text-right">Actions</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {rows.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-5 pr-3 font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        #{student.studentCode}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={student.fullName} indexOrRole={student.avatarIndex ?? 2} />
                          <div>
                            <div className="font-medium text-slate-900">{student.fullName}</div>
                            <div className="text-xs text-slate-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {student.classroomName || 'Unassigned'}
                      </td>
                      <td className="py-3 px-3 text-slate-700 tabular-nums">
                        Grade {student.gradeLevel}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>{student.guardianName || '-'}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          {student.guardianPhone}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 tabular-nums whitespace-nowrap">
                        {formatIsoDate(student.dateOfBirth)}
                      </td>
                      <td className="py-3 px-3">
                        <StatusText status={student.status} />
                      </td>
                      {isAdmin ? (
                        <td className="py-3 pl-3 pr-5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(student)}
                              aria-label={`Edit ${student.fullName}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F5DF5] hover:bg-[#EEF1FF] transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(student)}
                              aria-label={`Delete ${student.fullName}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {rows.map((student) => (
                <div key={student.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        name={student.fullName}
                        indexOrRole={student.avatarIndex ?? 2}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {student.fullName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          #{student.studentCode} · {student.classroomName || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                    <StatusText status={student.status} />
                  </div>
                  {isAdmin ? (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openEdit(student)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(student)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <Pagination
              page={studentsPage?.number ?? 0}
              totalPages={studentsPage?.totalPages ?? 1}
              totalElements={studentsPage?.totalElements ?? 0}
              size={studentsPage?.size ?? 12}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Create / Edit Student Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Student' : 'Add New Student'}
        description="Maintain student academic identity and guardian contact information."
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
              {form.formState.errors.username ? (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.username.message}
                </p>
              ) : null}
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
              {form.formState.errors.email ? (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Grade Level</label>
              <select
                {...form.register('gradeLevel')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              >
                {['9', '10', '11', '12'].map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Guardian Name
              </label>
              <input
                type="text"
                {...form.register('guardianName')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Guardian Phone
              </label>
              <input
                type="text"
                {...form.register('guardianPhone')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                {...form.register('dateOfBirth')}
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
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : editing ? 'Save Changes' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete Student"
        message={`Are you sure you want to remove ${deleting?.fullName}? This will also remove their classroom enrollments, grades, and attendance logs.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
