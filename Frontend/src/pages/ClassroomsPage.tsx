import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {BookOpen, Pencil, Plus, School, Search, Trash2} from 'lucide-react';
import {toast} from 'sonner';
import {classroomsApi} from '@/src/api/classrooms';
import {subjectsApi} from '@/src/api/subjects';
import {teachersApi} from '@/src/api/teachers';
import {ConfirmDialog} from '@/src/components/ui/ConfirmDialog';
import {EmptyState} from '@/src/components/ui/EmptyState';
import {Modal} from '@/src/components/ui/Modal';
import {Pagination} from '@/src/components/ui/Pagination';
import {TableSkeleton} from '@/src/components/ui/TableSkeleton';
import {useAuth} from '@/src/hooks/useAuth';
import {parseApiError} from '@/src/lib/errorParser';
import type {Classroom} from '@/src/types';

const classroomSchema = z.object({
  name: z.string().min(2, 'Classroom name is required'),
  grade: z.string().min(1, 'Grade is required'),
  academicYear: z.string().min(4, 'Academic year is required'),
  roomNumber: z.string().min(1, 'Room number is required'),
  capacity: z.number().min(1).max(100),
  homeroomTeacherId: z.string().optional(),
});

const assignSubjectSchema = z.object({
  classroomId: z.string().min(1, 'Classroom is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  teacherId: z.string().optional(),
  schedule: z.string().min(2, 'Schedule is required'),
});

type ClassroomFormValues = z.infer<typeof classroomSchema>;
type AssignSubjectValues = z.infer<typeof assignSubjectSchema>;

export function ClassroomsPage() {
  const {user} = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editing, setEditing] = useState<Classroom | null>(null);
  const [deleting, setDeleting] = useState<Classroom | null>(null);

  const {data: classroomsPage, isLoading} = useQuery({
    queryKey: ['classrooms', {page, search, gradeFilter}],
    queryFn: () =>
      classroomsApi.list({
        page,
        size: 12,
        search: search || undefined,
        grade: gradeFilter || undefined,
        sort: 'name,asc',
      }),
  });

  const {data: teachersPage} = useQuery({
    queryKey: ['teachers', 'dropdown'],
    queryFn: () => teachersApi.list({size: 50}),
  });

  const {data: subjectsPage} = useQuery({
    queryKey: ['subjects', 'dropdown'],
    queryFn: () => subjectsApi.list({size: 50}),
  });

  const {data: classroomSubjectsPage} = useQuery({
    queryKey: ['classroom-subjects'],
    queryFn: () => classroomsApi.listSubjects({size: 100}),
  });

  const form = useForm<ClassroomFormValues>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      name: '',
      grade: '10',
      academicYear: '2026-2027',
      roomNumber: 'Room 101',
      capacity: 30,
      homeroomTeacherId: '',
    },
  });

  const assignForm = useForm<AssignSubjectValues>({
    resolver: zodResolver(assignSubjectSchema),
    defaultValues: {
      classroomId: '',
      subjectId: '',
      teacherId: '',
      schedule: 'Mon/Wed/Fri 09:00 AM',
    },
  });

  const saveMutation = useMutation({
    mutationFn: (vals: ClassroomFormValues) => {
      const payload = {
        ...vals,
        homeroomTeacherId: vals.homeroomTeacherId ? Number(vals.homeroomTeacherId) : undefined,
      };
      return editing ? classroomsApi.update(editing.id, payload) : classroomsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Classroom updated' : 'Classroom created');
      queryClient.invalidateQueries({queryKey: ['classrooms']});
      setModalOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to save classroom').message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => classroomsApi.remove(id),
    onSuccess: () => {
      toast.success('Classroom deleted');
      queryClient.invalidateQueries({queryKey: ['classrooms']});
      setDeleting(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to delete classroom').message);
    },
  });

  const assignMutation = useMutation({
    mutationFn: (vals: AssignSubjectValues) =>
      classroomsApi.assignSubject({
        classroomId: Number(vals.classroomId),
        subjectId: Number(vals.subjectId),
        teacherId: vals.teacherId ? Number(vals.teacherId) : undefined,
        schedule: vals.schedule,
      }),
    onSuccess: () => {
      toast.success('Subject assigned to classroom');
      queryClient.invalidateQueries({queryKey: ['classroom-subjects']});
      setAssignModalOpen(false);
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to assign subject').message);
    },
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: (id: number) => classroomsApi.removeSubjectAssignment(id),
    onSuccess: () => {
      toast.success('Subject assignment removed');
      queryClient.invalidateQueries({queryKey: ['classroom-subjects']});
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to remove assignment').message);
    },
  });

  const classrooms = classroomsPage?.content || [];
  const teachers = teachersPage?.content || [];
  const subjects = subjectsPage?.content || [];
  const assignments = classroomSubjectsPage?.content || [];

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: '',
      grade: '10',
      academicYear: '2026-2027',
      roomNumber: 'Room 101',
      capacity: 30,
      homeroomTeacherId: '',
    });
    setModalOpen(true);
  };

  const openEdit = (c: Classroom) => {
    setEditing(c);
    form.reset({
      name: c.name,
      grade: c.grade,
      academicYear: c.academicYear,
      roomNumber: c.roomNumber,
      capacity: c.capacity,
      homeroomTeacherId: c.homeroomTeacherId ? String(c.homeroomTeacherId) : '',
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF1FF] text-[#4F5DF5] flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-sm text-slate-900">Classrooms</h2>
              <p className="text-xs text-slate-500">
                {classroomsPage?.totalElements ?? 0} active classrooms
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Filter by grade"
              value={gradeFilter}
              onChange={(e) => {
                setGradeFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg"
            >
              <option value="">All grades</option>
              {['9', '10', '11', '12'].map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>

            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Search classroom..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            {isAdmin ? (
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Classroom
              </button>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={4} cols={6} />
        ) : classrooms.length === 0 ? (
          <EmptyState
            icon={School}
            title="No classrooms found"
            description="Create classrooms to organize grade cohorts and schedules."
            actionLabel={isAdmin ? 'Add Classroom' : undefined}
            onAction={isAdmin ? openCreate : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FB] border-b border-slate-100 text-[12px] font-medium text-slate-500">
                    <th className="py-3 pl-5 pr-3">Classroom</th>
                    <th className="py-3 px-3">Grade</th>
                    <th className="py-3 px-3">Academic Year</th>
                    <th className="py-3 px-3">Room</th>
                    <th className="py-3 px-3">Homeroom Teacher</th>
                    <th className="py-3 px-3">Enrollment</th>
                    {isAdmin ? <th className="py-3 pl-3 pr-5 text-right">Actions</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {classrooms.map((cls) => (
                    <tr key={cls.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-5 pr-3 font-medium text-slate-900">{cls.name}</td>
                      <td className="py-3 px-3 text-slate-600 tabular-nums">Grade {cls.grade}</td>
                      <td className="py-3 px-3 text-slate-600 tabular-nums">{cls.academicYear}</td>
                      <td className="py-3 px-3 text-slate-600">{cls.roomNumber}</td>
                      <td className="py-3 px-3 text-slate-700">{cls.homeroomTeacherName}</td>
                      <td className="py-3 px-3 font-mono text-xs tabular-nums text-slate-700">
                        {cls.studentCount ?? 0} / {cls.capacity}
                      </td>
                      {isAdmin ? (
                        <td className="py-3 pl-3 pr-5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(cls)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F5DF5] hover:bg-[#EEF1FF]"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(cls)}
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
            <Pagination
              page={classroomsPage?.number ?? 0}
              totalPages={classroomsPage?.totalPages ?? 1}
              totalElements={classroomsPage?.totalElements ?? 0}
              size={classroomsPage?.size ?? 12}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Classroom Subject Assignments */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF1FF] text-[#4F5DF5] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-sm text-slate-900">
                Classroom Subject Schedule
              </h2>
              <p className="text-xs text-slate-500">
                Assigned subjects, instructors, and weekly meeting times
              </p>
            </div>
          </div>

          {isAdmin ? (
            <button
              type="button"
              onClick={() => {
                assignForm.reset({
                  classroomId: classrooms[0] ? String(classrooms[0].id) : '',
                  subjectId: subjects[0] ? String(subjects[0].id) : '',
                  teacherId: teachers[0] ? String(teachers[0].id) : '',
                  schedule: 'Mon/Wed/Fri 09:00 AM',
                });
                setAssignModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Assign Subject
            </button>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F9FB] border-b border-slate-100 text-[12px] font-medium text-slate-500">
                <th className="py-3 pl-5 pr-3">Classroom</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Teacher</th>
                <th className="py-3 px-3">Schedule</th>
                {isAdmin ? <th className="py-3 pl-3 pr-5 text-right">Remove</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {assignments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 pl-5 pr-3 font-medium text-slate-900">
                    {item.classroomName}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    <span className="font-mono text-xs text-[#4F5DF5] mr-1.5">
                      {item.subjectCode}
                    </span>
                    {item.subjectName}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{item.teacherName}</td>
                  <td className="py-3 px-3 text-slate-600">{item.schedule}</td>
                  {isAdmin ? (
                    <td className="py-3 pl-3 pr-5 text-right">
                      <button
                        type="button"
                        onClick={() => removeAssignmentMutation.mutate(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Classroom Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Classroom' : 'Add Classroom'}
      >
        <form
          onSubmit={form.handleSubmit((vals) => saveMutation.mutate(vals))}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Classroom Name
              </label>
              <input
                type="text"
                placeholder="Grade 10-A"
                {...form.register('name')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Grade</label>
              <select
                {...form.register('grade')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              >
                {['9', '10', '11', '12'].map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                {...form.register('academicYear')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Room</label>
              <input
                type="text"
                {...form.register('roomNumber')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Capacity</label>
              <input
                type="number"
                {...form.register('capacity', {valueAsNumber: true})}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Homeroom Teacher
            </label>
            <select
              {...form.register('homeroomTeacherId')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            >
              <option value="">Unassigned</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.subject})
                </option>
              ))}
            </select>
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
              {saveMutation.isPending ? 'Saving...' : 'Save Classroom'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Subject Modal */}
      <Modal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Subject to Classroom"
      >
        <form
          onSubmit={assignForm.handleSubmit((vals) => assignMutation.mutate(vals))}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Classroom</label>
            <select
              {...assignForm.register('classroomId')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            >
              <option value="">Select classroom</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
            <select
              {...assignForm.register('subjectId')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Teacher</label>
            <select
              {...assignForm.register('teacherId')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            >
              <option value="">Unassigned</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Schedule</label>
            <input
              type="text"
              {...assignForm.register('schedule')}
              placeholder="Mon/Wed/Fri 09:00 AM"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg disabled:opacity-50"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign Subject'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete Classroom"
        message={`Delete ${deleting?.name}? All student enrollments and subject assignments for this room will be removed.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
