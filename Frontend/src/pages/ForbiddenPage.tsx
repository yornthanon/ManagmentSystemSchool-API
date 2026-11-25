import {Link} from 'react-router-dom';
import {ShieldAlert} from 'lucide-react';

export function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
      <div className="bg-white border border-slate-200/80 rounded-xl p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="font-display text-lg font-bold text-slate-900">Access Denied</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Your role does not have permission to view this page or perform this action.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="px-4 py-2 text-sm font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
