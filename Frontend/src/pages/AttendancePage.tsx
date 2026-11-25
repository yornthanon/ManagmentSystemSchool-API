import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {CalendarCheck, Download, Pencil, Plus, Search, Trash2} from 'lucide-react';
import {toast} from 'sonner';
import {attendanceApi} from '@/src/api/attendance';
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
import type {Attendance, AttendanceStatus} from '@/src/types';

const attendanceSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  classroomId: z.string().min(1, 'Classroom is required'),
  date: z.string().min(1, 'Date is required'),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  status: z.enum(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED']),
  notes: z.string().optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export function AttendancePage() {
  const {user} = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'TEACHER';
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [classroomId, setClassroomId] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Attendance | null>(null);
  const [deleting, setDeleting] = useState<Attendance | null>(null);

  const {data: attendancePage, isLoading} = useQuery({
    queryKey: ['attendance', 'manage', {page, classroomId, dateFilter, statusFilter, search}],
    queryFn: () =>
      attendanceApi.list({
        page,
        size: 12,
        classroomId: classroomId || undefined,
        date: dateFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
        sort: 'date,desc',
      }),
  });

  const {data: classroomsPage} = useQuery({
    queryKey: ['classrooms', 'dropdown'],
    queryFn: () => classroomsApi.list({size: 50}),
  });

  const {data: studentsPage} = useQuery({
    queryKey: ['students', 'dropdown'],
    queryFn: () => studentsApi.list({size: 100}),
    enabled: canEdit,
  });

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      studentId: '',
      classroomId: '',
      date: todayIsoDate(),
      checkInTime: '08:15 AM',
      checkOutTime: '03:15 PM',
      status: 'PRESENT',
      notes: '',
    },
  });

  const saveMutation = useMutation({
    mutationFn: (vals: AttendanceFormValues) => {
      const payload = {
        studentId: Number(vals.studentId),
        classroomId: Number(vals.classroomId),
        date: vals.date,
        checkInTime: vals.status === 'ABSENT' ? '-' : vals.checkInTime || '08:15 AM',
        checkOutTime: vals.status === 'ABSENT' ? '-' : vals.checkOutTime || '03:15 PM',
        status: vals.status as AttendanceStatus,
        notes: vals.notes || '',
      };
      return editing ? attendanceApi.update(editing.id, payload) : attendanceApi.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Attendance updated' : 'Attendance recorded');
      queryClient.invalidateQueries({queryKey: ['attendance']});
      setModalOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to save attendance').message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => attendanceApi.remove(id),
    onSuccess: () => {
      toast.success('Attendance entry deleted');
      queryClient.invalidateQueries({queryKey: ['attendance']});
      setDeleting(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to delete attendance').message);
    },
  });

  const rows = attendancePage?.content || [];
  const classrooms = classroomsPage?.content || [];
  const students = studentsPage?.content || [];

  const openCreate = () => {
    setEditing(null);
    form.reset({
      studentId: students[0] ? String(students[0].id) : '',
      classroomId: classrooms[0] ? String(classrooms[0].id) : '',
      date: todayIsoDate(),
      checkInTime: '08:15 AM',
      checkOutTime: '03:15 PM',
      status: 'PRESENT',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEdit = (a: Attendance) => {
    setEditing(a);
    form.reset({
      studentId: String(a.studentId),
      classroomId: String(a.classroomId),
      date: a.date,
      checkInTime: a.checkInTime,
      checkOutTime: a.checkOutTime,
      status: a.status,
      notes: a.notes || '',
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF1FF] text-[#4F5DF5] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-sm text-slate-900">
                {canEdit ? 'Attendance Management' : 'My Attendance'}
              </h2>
              <p className="text-xs text-slate-500">
                {attendancePage?.totalElements ?? 0} total entries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                exportToCsv(
                  `attendance-${todayIsoDate()}.csv`,
                  rows.map((r) => ({
                    Code: r.studentCode,
                    Student: r.studentName,
                    Classroom: r.classroomName,
                    Date: r.date,
                    CheckIn: r.checkInTime,
                    CheckOut: r.checkOutTime,
                    Status: r.status,
                    Notes: r.notes,
                  })),
                )
              }
              disabled={rows.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

            {canEdit ? (
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Log Attendance
              </button>
            ) : null}
          </div>
        </div>

        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Filter by classroom"
              value={classroomId}
              onChange={(e) => {
                setClassroomId(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg"
            >
              <option value="">All classrooms</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              aria-label="Filter by date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg"
            />

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg"
            >
              <option value="">All statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
              <option value="EXCUSED">Excused</option>
            </select>
          </div>

          <div className="relative w-full lg:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search student..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records"
            description="Daily student check-ins and absence records will appear here."
            actionLabel={canEdit ? 'Log Attendance' : undefined}
            onAction={canEdit ? openCreate : undefined}
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
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Check-in</th>
                    <th className="py-3 px-3">Check-out</th>
                    <th className="py-3 px-3">Status</th>
                    {canEdit ? <th className="py-3 pl-3 pr-5 text-right">Actions</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-5 pr-3 font-mono text-xs text-slate-500">
                        #{row.studentCode}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={row.studentName} indexOrRole={row.avatarIndex ?? 2} />
                          <div>
                            <div className="font-medium text-slate-900">{row.studentName}</div>
                            {row.notes ? (
                              <div className="text-xs text-slate-400 truncate max-w-[180px]">
                                {row.notes}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{row.classroomName}</td>
                      <td className="py-3 px-3 text-slate-600 tabular-nums whitespace-nowrap">
                        {formatIsoDate(row.date)}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs tabular-nums text-slate-700">
                        {row.checkInTime}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs tabular-nums text-slate-700">
                        {row.checkOutTime}
                      </td>
                      <td className="py-3 px-3">
                        <StatusText status={row.status} />
                      </td>
                      {canEdit ? (
                        <td className="py-3 pl-3 pr-5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(row)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F5DF5] hover:bg-[#EEF1FF]"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(row)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
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

            <div className="md:hidden divide-y divide-slate-100">
              {rows.map((row) => (
                <div key={row.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{row.studentName}</p>
                    <p className="text-xs text-slate-500">
                      {row.classroomName} · {formatIsoDate(row.date)}
                    </p>
                  </div>
                  <StatusText status={row.status} />
                </div>
              ))}
            </div>

            <Pagination
              page={attendancePage?.number ?? 0}
              totalPages={attendancePage?.totalPages ?? 1}
              totalElements={attendancePage?.totalElements ?? 0}
              size={attendancePage?.size ?? 12}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Attendance' : 'Log Attendance'}
      >
        <form
          onSubmit={form.handleSubmit((vals) => saveMutation.mutate(vals))}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Student</label>
              <select
                disabled={Boolean(editing)}
                {...form.register('studentId')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg disabled:bg-slate-50"
              >
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} (#{s.studentCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Classroom</label>
              <select
                disabled={Boolean(editing)}
                {...form.register('classroomId')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg disabled:bg-slate-50"
              >
                <option value="">Select classroom</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                {...form.register('date')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                {...form.register('status')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              >
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="ABSENT">Absent</option>
                <option value="EXCUSED">Excused</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Check-In Time
              </label>
              <input
                type="text"
                {...form.register('checkInTime')}
                placeholder="08:15 AM"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Check-Out Time
              </label>
              <input
                type="text"
                {...form.register('checkOutTime')}
                placeholder="03:15 PM"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              placeholder="Optional attendance remarks"
              {...form.register('notes')}
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
              disabled={saveMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete Attendance Record"
        message={`Delete attendance record for ${deleting?.studentName} on ${deleting?.date}?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
