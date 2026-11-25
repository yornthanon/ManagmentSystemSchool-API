import React, {useEffect, useMemo, useRef, useState} from 'react';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {
  Award,
  Bell,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  School,
  Search,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import {announcementsApi} from '@/src/api/announcements';
import {Avatar} from '@/src/components/ui/Avatar';
import {Modal} from '@/src/components/ui/Modal';
import {useAuth} from '@/src/hooks/useAuth';
import {cn, formatIsoDate} from '@/src/lib/utils';
import type {Role} from '@/src/types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{className?: string}>;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  {
    label: 'Attendance',
    to: '/admin/attendance',
    icon: CalendarCheck,
    roles: ['ADMIN'],
  },
  {
    label: 'Attendance',
    to: '/teacher/attendance',
    icon: CalendarCheck,
    roles: ['TEACHER'],
  },
  {
    label: 'My Attendance',
    to: '/student/attendance',
    icon: CalendarCheck,
    roles: ['STUDENT'],
  },
  {
    label: 'Students',
    to: '/admin/students',
    icon: GraduationCap,
    roles: ['ADMIN'],
  },
  {
    label: 'Students',
    to: '/teacher/students',
    icon: GraduationCap,
    roles: ['TEACHER'],
  },
  {
    label: 'Teachers',
    to: '/admin/teachers',
    icon: UserCheck,
    roles: ['ADMIN'],
  },
  {
    label: 'Parents',
    to: '/admin/parents',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    label: 'Classrooms',
    to: '/admin/classrooms',
    icon: School,
    roles: ['ADMIN'],
  },
  {
    label: 'My Classes',
    to: '/teacher/classes',
    icon: School,
    roles: ['TEACHER'],
  },
  {
    label: 'My Classes',
    to: '/student/classes',
    icon: School,
    roles: ['STUDENT'],
  },
  {
    label: 'Subjects',
    to: '/admin/subjects',
    icon: BookOpen,
    roles: ['ADMIN'],
  },
  {
    label: 'Enrollment',
    to: '/admin/enrollment',
    icon: ClipboardList,
    roles: ['ADMIN'],
  },
  {
    label: 'Grades',
    to: '/admin/grades',
    icon: Award,
    roles: ['ADMIN'],
  },
  {
    label: 'Grades',
    to: '/teacher/grades',
    icon: Award,
    roles: ['TEACHER'],
  },
  {
    label: 'My Grades',
    to: '/student/grades',
    icon: Award,
    roles: ['STUDENT'],
  },
  {
    label: 'Announcements',
    to: '/announcements',
    icon: Megaphone,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  {
    label: 'Users',
    to: '/admin/users',
    icon: ShieldCheck,
    roles: ['ADMIN'],
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: UserCog,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
];

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.includes('attendance')) return 'Attendance';
  if (pathname.includes('students')) return 'Students';
  if (pathname.includes('teachers')) return 'Teachers';
  if (pathname.includes('parents')) return 'Parents';
  if (pathname.includes('subjects')) return 'Subjects';
  if (pathname.includes('classrooms') || pathname.includes('classes')) return 'Classrooms';
  if (pathname.includes('enrollment')) return 'Enrollment';
  if (pathname.includes('grades')) return 'Grades';
  if (pathname.includes('announcements')) return 'Announcements';
  if (pathname.includes('users')) return 'User Management';
  if (pathname.includes('profile')) return 'Profile';
  return 'Scholara';
}

export function AppLayout({children}: {children: React.ReactNode}) {
  const {user, logout} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');

  const bellRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const visibleNav = useMemo(
    () => (user ? NAV_ITEMS.filter((item) => item.roles.includes(user.role)) : []),
    [user],
  );

  const {data: recentAnnouncements = []} = useQuery({
    queryKey: ['announcements', 'recent'],
    queryFn: announcementsApi.recent,
    enabled: Boolean(user),
  });

  useEffect(() => {
    setMobileOpen(false);
    setBellOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const topTabs = useMemo(() => {
    if (!user) return [];
    if (user.role === 'ADMIN') {
      return [
        {label: 'Overview', to: '/dashboard'},
        {label: 'Attendance', to: '/admin/attendance'},
        {label: 'Grades', to: '/admin/grades'},
      ];
    }
    if (user.role === 'TEACHER') {
      return [
        {label: 'Overview', to: '/dashboard'},
        {label: 'Attendance', to: '/teacher/attendance'},
        {label: 'Grades', to: '/teacher/grades'},
      ];
    }
    if (user.role === 'STUDENT') {
      return [
        {label: 'Overview', to: '/dashboard'},
        {label: 'My Attendance', to: '/student/attendance'},
        {label: 'My Grades', to: '/student/grades'},
      ];
    }
    return [
      {label: 'Overview', to: '/dashboard'},
      {label: 'Family Info', to: '/parent/profile'},
      {label: 'Announcements', to: '/announcements'},
    ];
  }, [user]);

  const filteredQuickNav = useMemo(() => {
    const q = quickQuery.trim().toLowerCase();
    if (!q) return visibleNav;
    return visibleNav.filter((item) => item.label.toLowerCase().includes(q));
  }, [quickQuery, visibleNav]);

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-white border-r border-slate-200/80 shrink-0 transition-all duration-200 sticky top-0 h-screen',
          collapsed ? 'w-[72px]' : 'w-[228px]',
        )}
      >
        <div
          className={cn(
            'h-16 px-4 flex items-center border-b border-slate-100',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5 min-w-0 focus-visible:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#4F5DF5] text-white flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            {!collapsed ? (
              <span className="font-display font-bold text-base tracking-tight text-slate-900 whitespace-nowrap">
                Scholara
              </span>
            ) : null}
          </NavLink>
          {!collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Primary navigation">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({isActive}) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap',
                    collapsed ? 'justify-center px-2' : '',
                    isActive
                      ? 'bg-[#EEF1FF] text-[#4F5DF5]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          {collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="w-full flex items-center justify-center p-2.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-64 max-w-[80vw] bg-white h-full flex flex-col border-r border-slate-200">
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#4F5DF5] text-white flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-base text-slate-900">Scholara</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {visibleNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({isActive}) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-[#EEF1FF] text-[#4F5DF5]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      )
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="p-3 border-t border-slate-100">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display font-semibold text-lg text-slate-900 truncate">
              {pageTitle}
            </h1>
          </div>

          {/* Center contextual text tabs matching reference image */}
          <nav className="hidden md:flex items-center gap-7 h-full" aria-label="Workspace quick tabs">
            {topTabs.map((tab) => {
              const active = location.pathname === tab.to;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={cn(
                    'h-full inline-flex items-center text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap shrink-0',
                    active
                      ? 'border-[#4F5DF5] text-[#4F5DF5]'
                      : 'border-transparent text-slate-500 hover:text-slate-900',
                  )}
                >
                  {tab.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Utilities: Search, Announcements Bell, Profile Menu */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-[#F8F9FB] text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors text-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="pr-4">Quick jump</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500">
                ⌘K
              </kbd>
            </button>

            {/* Announcements Popover */}
            <div className="relative" ref={bellRef}>
              <button
                type="button"
                onClick={() => setBellOpen((prev) => !prev)}
                aria-label="Recent announcements"
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-4 h-4" />
              </button>
              {bellOpen ? (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      Recent Announcements
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/announcements')}
                      className="text-xs font-medium text-[#4F5DF5] hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {recentAnnouncements.length === 0 ? (
                      <p className="px-4 py-6 text-xs text-slate-500 text-center">
                        No announcements published yet.
                      </p>
                    ) : (
                      recentAnnouncements.map((ann) => (
                        <button
                          key={ann.id}
                          type="button"
                          onClick={() => navigate('/announcements')}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          <p className="text-xs font-medium text-slate-900 line-clamp-1">
                            {ann.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {ann.authorName} · {formatIsoDate(ann.publishedDate)}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Avatar name={user?.fullName} indexOrRole={user?.role} size="sm" />
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-medium text-slate-900 leading-none">
                    {user?.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-none mt-1">
                    {user?.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {userMenuOpen ? (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Account Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/announcements')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Announcements
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>

      {/* Quick Jump Modal */}
      <Modal
        open={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setQuickQuery('');
        }}
        title="Quick Navigation"
        description="Jump directly to any permitted school module."
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Search modules..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
            />
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {filteredQuickNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => {
                    navigate(item.to);
                    setSearchOpen(false);
                    setQuickQuery('');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-[#EEF1FF] hover:text-[#4F5DF5] rounded-lg transition-colors"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            {filteredQuickNav.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No matching modules found.</p>
            ) : null}
          </div>
        </div>
      </Modal>
    </div>
  );
}
