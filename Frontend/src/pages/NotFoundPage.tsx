import {Link} from 'react-router-dom';
import {Compass} from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
      <div className="bg-white border border-slate-200/80 rounded-xl p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-xl bg-[#EEF1FF] text-[#4F5DF5] flex items-center justify-center mx-auto mb-4">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="font-display text-lg font-bold text-slate-900">Page Not Found</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          The page you requested could not be found or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex px-4 py-2 text-sm font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
