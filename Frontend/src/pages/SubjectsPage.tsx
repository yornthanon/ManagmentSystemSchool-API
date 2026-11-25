import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {BookOpen, Pencil, Plus, Search, Trash2} from 'lucide-react';
import {toast} from 'sonner';
import {subjectsApi} from '@/src/api/subjects';
import {ConfirmDialog} from '@/src/components/ui/ConfirmDialog';
import {EmptyState} from '@/src/components/ui/EmptyState';
import {Modal} from '@/src/components/ui/Modal';
import {Pagination} from '@/src/components/ui/Pagination';
import {TableSkeleton} from '@/src/components/ui/TableSkeleton';
import {parseApiError} from '@/src/lib/errorParser';
import type {Subject} from '@/src/types';

const subjectSchema = z.object({
  code: z.string().min(2, 'Subject code is required'),
  name: z.string().min(2, 'Subject name is required'),
  department: z.string().min(2, 'Department is required'),
  credits: z.number().min(1).max(10),
  description: z.string().optional(),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

export function SubjectsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState<Subject | null>(null);

  const {data, isLoading} = useQuery({
    queryKey: ['subjects', {page, search}],
    queryFn: () => subjectsApi.list({page, size: 12, search: search || undefined, sort: 'code,asc'}),
  });

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {code: '', name: '', department: 'STEM', credits: 4, description: ''},
  });

  const saveMutation = useMutation({
    mutationFn: (vals: SubjectFormValues) =>
      editing ? subjectsApi.update(editing.id, vals) : subjectsApi.create(vals),
    onSuccess: () => {
      toast.success(editing ? 'Subject updated' : 'Subject created');
      queryClient.invalidateQueries({queryKey: ['subjects']});
      setModalOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to save subject').message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => subjectsApi.remove(id),
    onSuccess: () => {
      toast.success('Subject deleted');
      queryClient.invalidateQueries({queryKey: ['subjects']});
      setDeleting(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to delete subject').message);
    },
  });

  const rows = data?.content || [];

  const openCreate = () => {
    setEditing(null);
    form.reset({code: '', name: '', department: 'STEM', credits: 4, description: ''});
    setModalOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    form.reset({
      code: s.code,
      name: s.name,
      department: s.department,
      credits: s.credits,
      description: s.description || '',
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF1FF] text-[#4F5DF5] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-sm text-slate-900">
                Curriculum Subjects
              </h2>
              <p className="text-xs text-slate-500">{data?.totalElements ?? 0} catalog courses</p>
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
                placeholder="Search subject..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Subject
            </button>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No subjects found"
            description="Create curriculum subjects to assign them to classrooms and teachers."
            actionLabel="Add Subject"
            onAction={openCreate}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FB] border-b border-slate-100 text-[12px] font-medium text-slate-500">
                    <th className="py-3 pl-5 pr-3">Code</th>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Credits</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 pl-3 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {rows.map((subj) => (
                    <tr key={subj.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-5 pr-3 font-mono text-xs text-[#4F5DF5] font-medium">
                        {subj.code}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">{subj.name}</td>
                      <td className="py-3 px-3 text-slate-600">{subj.department}</td>
                      <td className="py-3 px-3 tabular-nums text-slate-700">{subj.credits}</td>
                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                        {subj.description || '-'}
                      </td>
                      <td className="py-3 pl-3 pr-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(subj)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F5DF5] hover:bg-[#EEF1FF]"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(subj)}
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Subject' : 'Add Subject'}
      >
        <form
          onSubmit={form.handleSubmit((vals) => saveMutation.mutate(vals))}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Code</label>
              <input
                type="text"
                placeholder="MATH-301"
                {...form.register('code')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Subject Name</label>
              <input
                type="text"
                placeholder="Mathematics"
                {...form.register('name')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <input
                type="text"
                {...form.register('department')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                min={1}
                max={10}
                {...form.register('credits', {valueAsNumber: true})}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              {...form.register('description')}
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
              {saveMutation.isPending ? 'Saving...' : 'Save Subject'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete Subject"
        message={`Delete ${deleting?.name} (${deleting?.code})?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
