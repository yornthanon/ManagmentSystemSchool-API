import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Award, Download, Pencil, Plus, Search, Trash2} from 'lucide-react';
import {toast} from 'sonner';
import {classroomsApi} from '@/src/api/classrooms';
import {gradesApi} from '@/src/api/grades';
import {studentsApi} from '@/src/api/students';
import {subjectsApi} from '@/src/api/subjects';
import {ConfirmDialog} from '@/src/components/ui/ConfirmDialog';
import {EmptyState} from '@/src/components/ui/EmptyState';
import {Modal} from '@/src/components/ui/Modal';
import {Pagination} from '@/src/components/ui/Pagination';
import {TableSkeleton} from '@/src/components/ui/TableSkeleton';
import {useAuth} from '@/src/hooks/useAuth';
import {parseApiError} from '@/src/lib/errorParser';
import {exportToCsv, formatIsoDate, todayIsoDate} from '@/src/lib/utils';
import type {Grade} from '@/src/types';

const gradeSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  classroomId: z.string().min(1, 'Classroom is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  term: z.string().min(2, 'Term is required'),
  assessmentName: z.string().min(2, 'Assessment name is required'),
  score: z.number().min(0, 'Score must be >= 0'),
  maxScore: z.number().min(1, 'Max score must be >= 1'),
  remarks: z.string().optional(),
  gradedDate: z.string().min(1, 'Date is required'),
});

type GradeFormValues = z.infer<typeof gradeSchema>;

export function GradesPage() {
  const {user} = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'TEACHER';
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [classroomId, setClassroomId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Grade | null>(null);
  const [deleting, setDeleting] = useState<Grade | null>(null);

  const {data: gradesPage, isLoading} = useQuery({
    queryKey: ['grades', {page, classroomId, subjectId, search}],
    queryFn: () =>
      gradesApi.list({
        page,
        size: 12,
        classroomId: classroomId || undefined,
        subjectId: subjectId || undefined,
        search: search || undefined,
        sort: 'gradedDate,desc',
      }),
  });

  const {data: classroomsPage} = useQuery({
    queryKey: ['classrooms', 'dropdown'],
    queryFn: () => classroomsApi.list({size: 50}),
  });

  const {data: subjectsPage} = useQuery({
    queryKey: ['subjects', 'dropdown'],
    queryFn: () => subjectsApi.list({size: 50}),
  });

  const {data: studentsPage} = useQuery({
    queryKey: ['students', 'dropdown'],
    queryFn: () => studentsApi.list({size: 100}),
    enabled: canEdit,
  });

  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      studentId: '',
      classroomId: '',
      subjectId: '',
      term: 'Fall 2026',
      assessmentName: '',
      score: 90,
      maxScore: 100,
      remarks: '',
      gradedDate: todayIsoDate(),
    },
  });

  const saveMutation = useMutation({
    mutationFn: (vals: GradeFormValues) => {
      const payload = {
        studentId: Number(vals.studentId),
        classroomId: Number(vals.classroomId),
        subjectId: Number(vals.subjectId),
        term: vals.term,
        assessmentName: vals.assessmentName,
        score: vals.score,
        maxScore: vals.maxScore,
        remarks: vals.remarks || '',
        gradedDate: vals.gradedDate,
      };
      return editing ? gradesApi.update(editing.id, payload) : gradesApi.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Grade updated' : 'Grade recorded');
      queryClient.invalidateQueries({queryKey: ['grades']});
      setModalOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      const parsed = parseApiError(err, 'Failed to save grade');
      toast.error(parsed.message);
      Object.entries(parsed.details).forEach(([field, msg]) => {
        if (field in form.getValues()) {
          form.setError(field as keyof GradeFormValues, {message: msg});
        }
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => gradesApi.remove(id),
    onSuccess: () => {
      toast.success('Grade deleted');
      queryClient.invalidateQueries({queryKey: ['grades']});
      setDeleting(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to delete grade').message);
    },
  });

  const rows = gradesPage?.content || [];
  const classrooms = classroomsPage?.content || [];
  const subjects = subjectsPage?.content || [];
  const students = studentsPage?.content || [];

  const openCreate = () => {
    setEditing(null);
    form.reset({
      studentId: students[0] ? String(students[0].id) : '',
      classroomId: classrooms[0] ? String(classrooms[0].id) : '',
      subjectId: subjects[0] ? String(subjects[0].id) : '',
      term: 'Fall 2026',
      assessmentName: '',
      score: 90,
      maxScore: 100,
      remarks: '',
      gradedDate: todayIsoDate(),
    });
    setModalOpen(true);
  };

  const openEdit = (g: Grade) => {
    setEditing(g);
    form.reset({
      studentId: String(g.studentId),
      classroomId: String(g.classroomId),
      subjectId: String(g.subjectId),
      term: g.term,
      assessmentName: g.assessmentName,
      score: g.score,
      maxScore: g.maxScore,
      remarks: g.remarks || '',
      gradedDate: g.gradedDate || todayIsoDate(),
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF1FF] text-[#4F5DF5] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-sm text-slate-900">
                {canEdit ? 'Gradebook & Assessments' : 'Academic Grades'}
              </h2>
              <p className="text-xs text-slate-500">
                {gradesPage?.totalElements ?? 0} assessment records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                exportToCsv(
                  `grades-${todayIsoDate()}.csv`,
                  rows.map((g) => ({
                    Student: g.studentName,
                    Classroom: g.classroomName,
                    Subject: g.subjectName,
                    Assessment: g.assessmentName,
                    Score: `${g.score}/${g.maxScore}`,
                    Letter: g.letterGrade,
                    Date: g.gradedDate,
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
                Record Grade
              </button>
            ) : null}
          </div>
        </div>

        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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

            <select
              aria-label="Filter by subject"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg"
            >
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
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
              placeholder="Search student or assessment..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No grade records found"
            description="Assessment scores and teacher remarks will appear here once graded."
            actionLabel={canEdit ? 'Record Grade' : undefined}
            onAction={canEdit ? openCreate : undefined}
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FB] border-b border-slate-100 text-[12px] font-medium text-slate-500">
                    <th className="py-3 pl-5 pr-3">Student</th>
                    <th className="py-3 px-3">Classroom</th>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Assessment</th>
                    <th className="py-3 px-3">Score</th>
                    <th className="py-3 px-3">Grade</th>
                    <th className="py-3 px-3">Date</th>
                    {canEdit ? <th className="py-3 pl-3 pr-5 text-right">Actions</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {rows.map((grade) => (
                    <tr key={grade.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-5 pr-3">
                        <div className="font-medium text-slate-900">{grade.studentName}</div>
                        <div className="text-xs font-mono text-slate-400">#{grade.studentCode}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{grade.classroomName}</td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{grade.subjectName}</td>
                      <td className="py-3 px-3">
                        <div className="text-slate-900">{grade.assessmentName}</div>
                        {grade.remarks ? (
                          <div className="text-xs text-slate-500 truncate max-w-[200px]">
                            {grade.remarks}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs tabular-nums text-slate-800">
                        {grade.score} / {grade.maxScore}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums ${
                            grade.letterGrade.startsWith('A')
                              ? 'bg-emerald-50 text-emerald-700'
                              : grade.letterGrade.startsWith('B')
                                ? 'bg-[#EEF1FF] text-[#4F5DF5]'
                                : grade.letterGrade.startsWith('C')
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {grade.letterGrade}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 tabular-nums whitespace-nowrap">
                        {formatIsoDate(grade.gradedDate)}
                      </td>
                      {canEdit ? (
                        <td className="py-3 pl-3 pr-5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(grade)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F5DF5] hover:bg-[#EEF1FF]"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(grade)}
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
              {rows.map((grade) => (
                <div key={grade.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {grade.subjectName} — {grade.assessmentName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {grade.studentName} · {grade.score}/{grade.maxScore}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#EEF1FF] text-[#4F5DF5] text-xs font-semibold">
                    {grade.letterGrade}
                  </span>
                </div>
              ))}
            </div>

            <Pagination
              page={gradesPage?.number ?? 0}
              totalPages={gradesPage?.totalPages ?? 1}
              totalElements={gradesPage?.totalElements ?? 0}
              size={gradesPage?.size ?? 12}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Grade' : 'Record Grade'}
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
              <select
                disabled={Boolean(editing)}
                {...form.register('subjectId')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg disabled:bg-slate-50"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Term</label>
              <input
                type="text"
                {...form.register('term')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Assessment Name
            </label>
            <input
              type="text"
              placeholder="Midterm Exam"
              {...form.register('assessmentName')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Score</label>
              <input
                type="number"
                step="0.5"
                {...form.register('score', {valueAsNumber: true})}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
              {form.formState.errors.score ? (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.score.message}</p>
              ) : null}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Max Score</label>
              <input
                type="number"
                {...form.register('maxScore', {valueAsNumber: true})}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Graded Date</label>
              <input
                type="date"
                {...form.register('gradedDate')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Remarks</label>
            <input
              type="text"
              placeholder="Optional feedback"
              {...form.register('remarks')}
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
              {saveMutation.isPending ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete Grade"
        message={`Remove grade "${deleting?.assessmentName}" for ${deleting?.studentName}?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
