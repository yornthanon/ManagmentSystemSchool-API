import {useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {
  ArrowUpDown,
  Award,
  BookOpen,
  Calendar,
  CalendarCheck,
  Clock,
  Download,
  Megaphone,
  Search,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {announcementsApi} from '@/src/api/announcements';
import {attendanceApi} from '@/src/api/attendance';
import {classroomsApi} from '@/src/api/classrooms';
import {gradesApi} from '@/src/api/grades';
import {studentsApi} from '@/src/api/students';
import {teachersApi} from '@/src/api/teachers';
import {Avatar} from '@/src/components/ui/Avatar';
import {EmptyState} from '@/src/components/ui/EmptyState';
import {Pagination} from '@/src/components/ui/Pagination';
import {StatCard} from '@/src/components/ui/StatCard';
import {StatusText} from '@/src/components/ui/StatusText';
import {TableSkeleton} from '@/src/components/ui/TableSkeleton';
import {useAuth} from '@/src/hooks/useAuth';
import {exportToCsv, formatIsoDate, todayIsoDate} from '@/src/lib/utils';

export function DashboardPage() {
  const {user} = useAuth();
  const isStaff = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const [classroomId, setClassroomId] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [sortField, setSortField] = useState<'studentCode' | 'studentName' | 'date' | 'status'>(
    'date',
  );
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);

  const {data: studentCountRes} = useQuery({
    queryKey: ['students', 'count'],
    queryFn: studentsApi.count,
    enabled: Boolean(user),
  });

  const {data: teacherCountRes} = useQuery({
    queryKey: ['teachers', 'count'],
    queryFn: teachersApi.count,
    enabled: user?.role === 'ADMIN',
  });

  const {data: classroomsPage} = useQuery({
    queryKey: ['classrooms', 'dropdown'],
    queryFn: () => classroomsApi.list({size: 50}),
    enabled: Boolean(user),
  });

  const {data: attendancePage, isLoading: attendanceLoading} = useQuery({
    queryKey: [
      'attendance',
      'dashboard',
      {page, classroomId, dateFilter, search, sortField, sortDir},
    ],
    queryFn: () =>
      attendanceApi.list({
        page,
        size: 10,
        classroomId: classroomId || undefined,
        date: dateFilter || undefined,
        search: search || undefined,
        sort: `${sortField},${sortDir}`,
      }),
    enabled: Boolean(user),
  });

  const {data: allAttendanceToday} = useQuery({
    queryKey: ['attendance', 'summary', todayIsoDate()],
    queryFn: () => attendanceApi.list({size: 100}),
    enabled: Boolean(user),
  });

  const {data: gradeStatus} = useQuery({
    queryKey: ['grades', 'status'],
    queryFn: gradesApi.getStatus,
    enabled: Boolean(user),
  });

  const {data: attendancePct} = useQuery({
    queryKey: ['attendance', 'percentage'],
    queryFn: () => attendanceApi.getPercentage(),
    enabled: Boolean(user),
  });

  const {data: recentAnnouncements = []} = useQuery({
    queryKey: ['announcements', 'recent'],
    queryFn: announcementsApi.recent,
    enabled: Boolean(user),
  });

  const metrics = useMemo(() => {
    const records = allAttendanceToday?.content || [];
    const todayStr = todayIsoDate();
    const todayRecords = records.filter((r) => r.date === todayStr);
    const activeSet = todayRecords.length > 0 ? todayRecords : records;

    const presentCount = activeSet.filter((r) => r.status === 'PRESENT').length;
    const lateCount = activeSet.filter((r) => r.status === 'LATE').length;
    const absentCount = activeSet.filter((r) => r.status === 'ABSENT').length;

    return {
      presentCount,
      lateCount,
      absentCount,
      totalRecords: records.length,
    };
  }, [allAttendanceToday]);

  const chartData = useMemo(() => {
    const records = allAttendanceToday?.content || [];
    const byDate = new Map<string, {date: string; Present: number; Late: number; Absent: number}>();
    for (const r of records) {
      if (!byDate.has(r.date)) {
        byDate.set(r.date, {date: formatIsoDate(r.date), Present: 0, Late: 0, Absent: 0});
      }
      const bucket = byDate.get(r.date)!;
      if (r.status === 'PRESENT') bucket.Present += 1;
      else if (r.status === 'LATE') bucket.Late += 1;
      else if (r.status === 'ABSENT') bucket.Absent += 1;
    }
    return Array.from(byDate.values()).slice(0, 7).reverse();
  }, [allAttendanceToday]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  const handleDownloadCsv = () => {
    const rows = (attendancePage?.content || []).map((row) => ({
      ID: row.studentCode || row.studentId,
      Student: row.studentName || '',
      Classroom: row.classroomName || '',
      Date: row.date,
      CheckIn: row.checkInTime,
      CheckOut: row.checkOutTime,
      Status: row.status,
    }));
    exportToCsv(`attendance-${todayIsoDate()}.csv`, rows);
  };

  const classrooms = classroomsPage?.content || [];
  const rows = attendancePage?.content || [];

  return (
    <div className="space-y-6">
      {/* Top 4-Column KPI Metric Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isStaff ? (
          <>
            <StatCard
              title="Students Present"
              value={metrics.presentCount}
              icon={UserCheck}
              delta={`${attendancePct?.percentage ?? 100}%`}
              deltaTone="positive"
              context="attendance rate"
            />
            <StatCard
              title="Late Arrivals"
              value={metrics.lateCount}
              icon={Clock}
              delta="Morning bell"
              deltaTone="neutral"
              context="checked in after 08:30 AM"
            />
            <StatCard
              title="Students Absent"
              value={metrics.absentCount}
              icon={UserX}
              delta={metrics.absentCount > 0 ? 'Requires follow-up' : 'All accounted'}
              deltaTone={metrics.absentCount > 0 ? 'negative' : 'positive'}
              context="today"
            />
            <StatCard
              title={user?.role === 'ADMIN' ? 'Total Enrolled' : 'Class Grade Avg'}
              value={
                user?.role === 'ADMIN'
                  ? studentCountRes?.count ?? 0
                  : `${gradeStatus?.averagePercentage ?? 0}%`
              }
              icon={user?.role === 'ADMIN' ? Users : Award}
              delta={
                user?.role === 'ADMIN'
                  ? `${teacherCountRes?.count ?? 0} teachers`
                  : `${gradeStatus?.total ?? 0} graded items`
              }
              deltaTone="neutral"
              context={user?.role === 'ADMIN' ? 'active roster' : 'current term'}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Attendance Rate"
              value={`${attendancePct?.percentage ?? 100}%`}
              icon={CalendarCheck}
              delta={`${attendancePct?.attended ?? 0}/${attendancePct?.total ?? 0}`}
              deltaTone="positive"
              context="sessions attended"
            />
            <StatCard
              title="Academic Average"
              value={`${gradeStatus?.averagePercentage ?? 0}%`}
              icon={Award}
              delta={`${gradeStatus?.passingCount ?? 0} passing`}
              deltaTone="positive"
              context="graded assessments"
            />
            <StatCard
              title="Active Classrooms"
              value={classrooms.length}
              icon={BookOpen}
              delta="2026–2027"
              deltaTone="neutral"
              context="academic year"
            />
            <StatCard
              title="School Notices"
              value={recentAnnouncements.length}
              icon={Megaphone}
              delta="Recent updates"
              deltaTone="neutral"
              context="published"
            />
          </>
        )}
      </section>

      {/* Main Attendance History Data Grid (matching reference layout) */}
      <section className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF1FF] text-[#4F5DF5] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <h2 className="font-display font-semibold text-sm text-slate-900">
              Attendance History
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {isStaff ? (
              <Link
                to={user?.role === 'ADMIN' ? '/admin/attendance' : '/teacher/attendance'}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                Manage Attendance
              </Link>
            ) : null}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
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

            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="date"
                aria-label="Filter by date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(0);
                }}
                className="pl-8 pr-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
            </div>

            {dateFilter || classroomId || search ? (
              <button
                type="button"
                onClick={() => {
                  setClassroomId('');
                  setDateFilter('');
                  setSearch('');
                  setPage(0);
                }}
                className="px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Reset
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Search student..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
            </div>

            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={rows.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Download data
            </button>
          </div>
        </div>

        {/* Table Content */}
        {attendanceLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records found"
            description="Adjust the classroom, date, or search filters to view recorded sessions."
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FB] border-b border-slate-100 text-[12px] font-medium text-slate-500">
                    <th className="py-3 pl-5 pr-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('studentCode')}
                        className="inline-flex items-center gap-1 hover:text-slate-900"
                      >
                        # ID <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('studentName')}
                        className="inline-flex items-center gap-1 hover:text-slate-900"
                      >
                        Name <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-3">Classroom</th>
                    <th className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('date')}
                        className="inline-flex items-center gap-1 hover:text-slate-900"
                      >
                        Date <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-3">Check-in</th>
                    <th className="py-3 px-3">Check-out</th>
                    <th className="py-3 pl-3 pr-5">
                      <button
                        type="button"
                        onClick={() => toggleSort('status')}
                        className="inline-flex items-center gap-1 hover:text-slate-900"
                      >
                        Status <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-5 pr-3 font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        #{row.studentCode || row.studentId}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar name={row.studentName} indexOrRole={row.avatarIndex ?? 2} />
                          <span className="font-medium text-slate-900 truncate">
                            {row.studentName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {row.classroomName}
                      </td>
                      <td className="py-3 px-3 text-slate-600 tabular-nums whitespace-nowrap">
                        {formatIsoDate(row.date)}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-mono text-xs tabular-nums whitespace-nowrap">
                        {row.checkInTime}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-mono text-xs tabular-nums whitespace-nowrap">
                        {row.checkOutTime}
                      </td>
                      <td className="py-3 pl-3 pr-5">
                        <StatusText status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-slate-100">
              {rows.map((row) => (
                <div key={row.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={row.studentName} indexOrRole={row.avatarIndex ?? 2} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {row.studentName}
                      </p>
                      <p className="text-xs text-slate-500 tabular-nums">
                        #{row.studentCode} · {row.classroomName} · {formatIsoDate(row.date)}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5 tabular-nums">
                        In: {row.checkInTime} · Out: {row.checkOutTime}
                      </p>
                    </div>
                  </div>
                  <StatusText status={row.status} />
                </div>
              ))}
            </div>

            <Pagination
              page={attendancePage?.number ?? 0}
              totalPages={attendancePage?.totalPages ?? 1}
              totalElements={attendancePage?.totalElements ?? 0}
              size={attendancePage?.size ?? 10}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      {/* Secondary Row: Weekly Attendance Chart + Recent Announcements */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-sm text-slate-900">
                Attendance Trend
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily breakdown of present, late, and absent logs
              </p>
            </div>
          </div>
          <div className="h-60 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Not enough attendance records to chart yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{top: 8, right: 8, left: -18, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Present" fill="#4F5DF5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Late" fill="#D97706" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Absent" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm text-slate-900">Announcements</h2>
            <Link to="/announcements" className="text-xs font-medium text-[#4F5DF5] hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {recentAnnouncements.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">
                No announcements published yet.
              </p>
            ) : (
              recentAnnouncements.slice(0, 4).map((ann) => (
                <div key={ann.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-900 line-clamp-1">
                      {ann.title}
                    </span>
                    <StatusText status={ann.category} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{ann.content}</p>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    {ann.authorName} · {formatIsoDate(ann.publishedDate)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
