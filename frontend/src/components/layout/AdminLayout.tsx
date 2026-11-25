import React, {useState} from 'react';
import {NavLink} from 'react-router-dom';
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  UserCheck,
  X,
} from 'lucide-react';
import {useAuth} from '@/src/hooks/useAuth';
import {cn} from '@/src/lib/utils';

const ADMIN_NAV = [
  {label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard},
  {label: 'Subjects', to: '/admin/subjects', icon: BookOpen},
  {label: 'Teachers', to: '/admin/teachers', icon: UserCheck},
  {label: 'Students', to: '/admin/students', icon: GraduationCap},
  {label: 'Classrooms', to: '/admin/classrooms', icon: School},
  {label: 'Enrollments', to: '/admin/enrollments', icon: ClipboardList},
];

export function AdminLayout({children}: {children: React.ReactNode}) {
  const {user, logout} = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({isActive}) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-[#EEF1FF] text-[#4F5DF5]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
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
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-slate-900 truncate">{user?.email}</p>
          <p className="text-[11px] text-slate-500">Administrator</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 flex">
      <aside className="hidden lg:flex flex-col w-[228px] bg-white border-r border-slate-200/80 shrink-0 sticky top-0 h-screen">
        <div className="h-16 px-4 flex items-center gap-2.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-[#4F5DF5] text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-slate-900">
            Scholara
          </span>
        </div>
        {navContent}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-64 bg-white h-full flex flex-col border-r border-slate-200">
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
              <span className="font-display font-bold text-base text-slate-900">Scholara Admin</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      ) : null}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-slate-800">Admin Portal</span>
          </div>
          <span className="text-xs font-medium text-slate-500">{user?.email}</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
