import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {ClipboardList, Plus, Trash2} from 'lucide-react';
import {toast} from 'sonner';
import {classroomsApi} from '@/src/api/classrooms';
import {studentsApi} from '@/src/api/students';
import {ConfirmDialog} from '@/src/components/ui/ConfirmDialog';
import {EmptyState} from '@/src/components/ui/EmptyState';
import {Modal} from '@/src/components/ui/Modal';
import {Pagination} from '@/src/components/ui/Pagination';
import {StatusText} from '@/src/components/ui/StatusText';
import {TableSkeleton} from '@/src/components/ui/TableSkeleton';
import {parseApiError} from '@/src/lib/errorParser';
import {formatIsoDate, todayIsoDate} from '@/src/lib/utils';
import type {StudentClassEnrollment} from '@/src/types';

const enrollSchema = z.object({
  studentId: z.string().min(1, 'Select a student'),
  classroomId: z.string().min(1, 'Select a classroom'),
  enrolledDate: z.string().min(1, 'Enrollment date is required'),
});

type EnrollValues = z.infer<typeof enrollSchema>;

export function EnrollmentPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [removing, setRemoving] = useState<StudentClassEnrollment | null>(null);

  const {data: enrollmentsPage, isLoading} = useQuery({
    queryKey: ['enrollments', {page}],
    queryFn: () => studentsApi.listEnrollments({page, size: 15}),
  });

  const {data: studentsPage} = useQuery({
    queryKey: ['students', 'dropdown'],
    queryFn: () => studentsApi.list({size: 100}),
  });

  const {data: classroomsPage} = useQuery({
    queryKey: ['classrooms', 'dropdown'],
    queryFn: () => classroomsApi.list({size: 50}),
  });

  const form = useForm<EnrollValues>({
    resolver: zodResolver(enrollSchema),
    defaultValues: {
      studentId: '',
      classroomId: '',
      enrolledDate: todayIsoDate(),
    },
  });

  const enrollMutation = useMutation({
    mutationFn: (vals: EnrollValues) =>
      studentsApi.enrollStudent({
        studentId: Number(vals.studentId),
        classroomId: Number(vals.classroomId),
        enrolledDate: vals.enrolledDate,
      }),
    onSuccess: () => {
      toast.success('Student enrolled in classroom');
      queryClient.invalidateQueries({queryKey: ['enrollments']});
      queryClient.invalidateQueries({queryKey: ['students']});
      queryClient.invalidateQueries({queryKey: ['classrooms']});
      setModalOpen(false);
    },
    onError: (err) => {
      const parsed = parseApiError(err, 'Failed to enroll student');
      toast.error(parsed.message);
      Object.entries(parsed.details).forEach(([field, msg]) => {
        if (field in form.getValues()) {
          form.setError(field as keyof EnrollValues, {message: msg});
        }
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => studentsApi.removeEnrollment(id),
    onSuccess: () => {
      toast.success('Enrollment removed');
      queryClient.invalidateQueries({queryKey: ['enrollments']});
      queryClient.invalidateQueries({queryKey: ['students']});
      queryClient.invalidateQueries({queryKey: ['classrooms']});
      setRemoving(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to remove enrollment').message);
    },
  });

  const rows = enrollmentsPage?.content || [];
  const students = studentsPage?.content || [];
  const classrooms = classroomsPage?.content || [];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF1FF] text-[#4F5DF5] flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-sm text-slate-900">
                Student Class Enrollments
              </h2>
              <p className="text-xs text-slate-500">
                {enrollmentsPage?.totalElements ?? 0} active enrollments
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              form.reset({
                studentId: students[0] ? String(students[0].id) : '',
                classroomId: classrooms[0] ? String(classrooms[0].id) : '',
                enrolledDate: todayIsoDate(),
              });
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Enroll Student
          </button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No enrollments recorded"
            description="Assign students to classrooms to track attendance and academic grades."
            actionLabel="Enroll Student"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FB] border-b border-slate-100 text-[12px] font-medium text-slate-500">
                    <th className="py-3 pl-5 pr-3"># ID</th>
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Classroom</th>
                    <th className="py-3 px-3">Academic Year</th>
                    <th className="py-3 px-3">Enrolled Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 pl-3 pr-5 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {rows.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-5 pr-3 font-mono text-xs text-slate-500">
                        #{item.studentCode}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">{item.studentName}</td>
                      <td className="py-3 px-3 text-slate-700">{item.classroomName}</td>
                      <td className="py-3 px-3 text-slate-600 tabular-nums">
                        {item.academicYear}
                      </td>
                      <td className="py-3 px-3 text-slate-600 tabular-nums">
                        {formatIsoDate(item.enrolledDate)}
                      </td>
                      <td className="py-3 px-3">
                        <StatusText status={item.status} />
                      </td>
                      <td className="py-3 pl-3 pr-5 text-right">
                        <button
                          type="button"
                          onClick={() => setRemoving(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={enrollmentsPage?.number ?? 0}
              totalPages={enrollmentsPage?.totalPages ?? 1}
              totalElements={enrollmentsPage?.totalElements ?? 0}
              size={enrollmentsPage?.size ?? 15}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Enroll Student in Classroom"
      >
        <form
          onSubmit={form.handleSubmit((vals) => enrollMutation.mutate(vals))}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Student</label>
            <select
              {...form.register('studentId')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} (#{s.studentCode})
                </option>
              ))}
            </select>
            {form.formState.errors.studentId ? (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.studentId.message}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Classroom</label>
            <select
              {...form.register('classroomId')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            >
              <option value="">Select classroom</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.academicYear})
                </option>
              ))}
            </select>
            {form.formState.errors.classroomId ? (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.classroomId.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Enrollment Date
            </label>
            <input
              type="date"
              {...form.register('enrolledDate')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
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
              disabled={enrollMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg disabled:opacity-50"
            >
              {enrollMutation.isPending ? 'Enrolling...' : 'Confirm Enrollment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && removeMutation.mutate(removing.id)}
        title="Remove Enrollment"
        message={`Unenroll ${removing?.studentName} from ${removing?.classroomName}?`}
        confirmLabel="Remove"
        isLoading={removeMutation.isPending}
      />
    </div>
  );
}
