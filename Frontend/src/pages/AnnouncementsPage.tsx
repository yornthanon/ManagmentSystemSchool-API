import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Megaphone, Pencil, Pin, Plus, Search, Trash2} from 'lucide-react';
import {toast} from 'sonner';
import {announcementsApi} from '@/src/api/announcements';
import {ConfirmDialog} from '@/src/components/ui/ConfirmDialog';
import {EmptyState} from '@/src/components/ui/EmptyState';
import {Modal} from '@/src/components/ui/Modal';
import {Pagination} from '@/src/components/ui/Pagination';
import {StatusText} from '@/src/components/ui/StatusText';
import {TableSkeleton} from '@/src/components/ui/TableSkeleton';
import {useAuth} from '@/src/hooks/useAuth';
import {parseApiError} from '@/src/lib/errorParser';
import {formatIsoDate} from '@/src/lib/utils';
import type {Announcement} from '@/src/types';

const announcementSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  content: z.string().min(5, 'Content is required'),
  category: z.enum(['ACADEMIC', 'EVENT', 'URGENT', 'GENERAL']),
  audience: z.enum(['ALL', 'TEACHERS', 'STUDENTS']),
  pinned: z.boolean().optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export function AnnouncementsPage() {
  const {user} = useAuth();
  const canPublish = user?.role === 'ADMIN' || user?.role === 'TEACHER';
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState<Announcement | null>(null);

  const {data, isLoading} = useQuery({
    queryKey: ['announcements', 'list', {page, keyword}],
    queryFn: () =>
      announcementsApi.list({
        page,
        size: 10,
        keyword: keyword || undefined,
        sort: 'publishedDate,desc',
      }),
  });

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'GENERAL',
      audience: 'ALL',
      pinned: false,
    },
  });

  const saveMutation = useMutation({
    mutationFn: (vals: AnnouncementFormValues) =>
      editing ? announcementsApi.update(editing.id, vals) : announcementsApi.create(vals),
    onSuccess: () => {
      toast.success(editing ? 'Announcement updated' : 'Announcement published');
      queryClient.invalidateQueries({queryKey: ['announcements']});
      setModalOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to save announcement').message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => announcementsApi.remove(id),
    onSuccess: () => {
      toast.success('Announcement deleted');
      queryClient.invalidateQueries({queryKey: ['announcements']});
      setDeleting(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, 'Failed to delete announcement').message);
    },
  });

  const rows = data?.content || [];

  const openCreate = () => {
    setEditing(null);
    form.reset({
      title: '',
      content: '',
      category: 'GENERAL',
      audience: 'ALL',
      pinned: false,
    });
    setModalOpen(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditing(ann);
    form.reset({
      title: ann.title,
      content: ann.content,
      category: ann.category,
      audience: ann.audience,
      pinned: ann.pinned,
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF1FF] text-[#4F5DF5] flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-sm text-slate-900">
                School Announcements
              </h2>
              <p className="text-xs text-slate-500">
                {data?.totalElements ?? 0} published bulletins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(0);
                }}
                placeholder="Search notices..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            {canPublish ? (
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Publish Notice
              </button>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements yet"
            description="Important academic updates, events, and school reminders will appear here."
            actionLabel={canPublish ? 'Publish Notice' : undefined}
            onAction={canPublish ? openCreate : undefined}
          />
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {rows.map((ann) => (
                <article key={ann.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {ann.pinned ? (
                          <Pin className="w-3.5 h-3.5 text-[#4F5DF5] shrink-0" />
                        ) : null}
                        <h3 className="font-display font-semibold text-sm text-slate-900">
                          {ann.title}
                        </h3>
                        <StatusText status={ann.category} />
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{ann.content}</p>
                      <div className="text-xs text-slate-400 pt-1">
                        {ann.authorName} · Audience: {ann.audience} ·{' '}
                        {formatIsoDate(ann.publishedDate)}
                      </div>
                    </div>

                    {canPublish ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEdit(ann)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#4F5DF5] hover:bg-[#EEF1FF]"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(ann)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            <Pagination
              page={data?.number ?? 0}
              totalPages={data?.totalPages ?? 1}
              totalElements={data?.totalElements ?? 0}
              size={data?.size ?? 10}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Announcement' : 'Publish Announcement'}
      >
        <form
          onSubmit={form.handleSubmit((vals) => saveMutation.mutate(vals))}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              {...form.register('title')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
              <select
                {...form.register('category')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              >
                <option value="GENERAL">General</option>
                <option value="ACADEMIC">Academic</option>
                <option value="EVENT">Event</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Audience</label>
              <select
                {...form.register('audience')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              >
                <option value="ALL">All Campus</option>
                <option value="TEACHERS">Teachers</option>
                <option value="STUDENTS">Students</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Message</label>
            <textarea
              rows={4}
              {...form.register('content')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input type="checkbox" {...form.register('pinned')} className="rounded border-slate-300" />
            Pin announcement to top
          </label>

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
              {saveMutation.isPending ? 'Publishing...' : 'Save Notice'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete Announcement"
        message={`Delete "${deleting?.title}"?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
