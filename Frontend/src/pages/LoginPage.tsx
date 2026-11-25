import {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {GraduationCap, Lock, Mail, ShieldCheck, User} from 'lucide-react';
import {toast} from 'sonner';
import {useAuth} from '@/src/hooks/useAuth';
import {parseApiError} from '@/src/lib/errorParser';

const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

const setupAdminSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SetupAdminValues = z.infer<typeof setupAdminSchema>;

export function LoginPage() {
  const {login, setupAdmin, needsAdminSetup} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [setupMode, setSetupMode] = useState(needsAdminSetup);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setSetupMode(needsAdminSetup);
  }, [needsAdminSetup]);

  const from = (location.state as {from?: {pathname?: string}} | null)?.from?.pathname || '/dashboard';

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {email: '', password: ''},
  });

  const setupForm = useForm<SetupAdminValues>({
    resolver: zodResolver(setupAdminSchema),
    defaultValues: {fullName: '', username: '', email: '', password: ''},
  });

  const onLoginSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      toast.success('Signed in successfully');
      navigate(from, {replace: true});
    } catch (err) {
      const parsed = parseApiError(err, 'Invalid email or password');
      setFormError(parsed.message);
    }
  };

  const onSetupSubmit = async (values: SetupAdminValues) => {
    setFormError(null);
    try {
      await setupAdmin(values);
      toast.success('Administrator account created');
      navigate('/dashboard', {replace: true});
    } catch (err) {
      const parsed = parseApiError(err, 'Unable to initialize administrator');
      setFormError(parsed.message);
      Object.entries(parsed.details).forEach(([field, msg]) => {
        if (field in values) {
          setupForm.setError(field as keyof SetupAdminValues, {message: msg});
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#4F5DF5] text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">
            Scholara
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-7">
          {setupMode ? (
            <>
              <div className="flex items-center gap-2 text-[#4F5DF5] text-xs font-medium mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>First-Time Workspace Setup</span>
              </div>
              <h1 className="font-display text-xl font-bold text-slate-900">
                Create School Administrator
              </h1>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Claim the primary administrator account to unlock school dashboards, user management,
                attendance, and grading.
              </p>

              {formError ? (
                <div className="mt-4 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {formError}
                </div>
              ) : null}

              <form onSubmit={setupForm.handleSubmit(onSetupSubmit)} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      {...setupForm.register('fullName')}
                      placeholder="Dr. Eleanor Vance"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
                    />
                  </div>
                  {setupForm.formState.errors.fullName ? (
                    <p className="mt-1 text-xs text-red-600">
                      {setupForm.formState.errors.fullName.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    {...setupForm.register('username')}
                    placeholder="principal.vance"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
                  />
                  {setupForm.formState.errors.username ? (
                    <p className="mt-1 text-xs text-red-600">
                      {setupForm.formState.errors.username.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      {...setupForm.register('email')}
                      placeholder="admin@scholara.edu"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
                    />
                  </div>
                  {setupForm.formState.errors.email ? (
                    <p className="mt-1 text-xs text-red-600">
                      {setupForm.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      {...setupForm.register('password')}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
                    />
                  </div>
                  {setupForm.formState.errors.password ? (
                    <p className="mt-1 text-xs text-red-600">
                      {setupForm.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={setupForm.formState.isSubmitting}
                  className="w-full py-2.5 px-4 text-sm font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg transition-colors disabled:opacity-50"
                >
                  {setupForm.formState.isSubmitting
                    ? 'Creating Administrator...'
                    : 'Initialize Admin & Enter'}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setSetupMode(false);
                    setFormError(null);
                  }}
                  className="text-[#4F5DF5] font-medium hover:underline"
                >
                  Use existing account
                </button>
                <Link to="/register" className="text-slate-600 hover:text-slate-900">
                  Student registration
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-xl font-bold text-slate-900">Sign in to Scholara</h1>
              <p className="mt-1 text-xs text-slate-500">
                Enter your school email or username and password to continue.
              </p>

              {formError ? (
                <div className="mt-4 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {formError}
                </div>
              ) : null}

              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoComplete="username"
                      {...loginForm.register('email')}
                      placeholder="name@scholara.edu"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
                    />
                  </div>
                  {loginForm.formState.errors.email ? (
                    <p className="mt-1 text-xs text-red-600">
                      {loginForm.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      autoComplete="current-password"
                      {...loginForm.register('password')}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
                    />
                  </div>
                  {loginForm.formState.errors.password ? (
                    <p className="mt-1 text-xs text-red-600">
                      {loginForm.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={loginForm.formState.isSubmitting}
                  className="w-full py-2.5 px-4 text-sm font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg transition-colors disabled:opacity-50"
                >
                  {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  New student?{' '}
                  <Link to="/register" className="text-[#4F5DF5] font-medium hover:underline">
                    Create account
                  </Link>
                </span>
                {needsAdminSetup ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSetupMode(true);
                      setFormError(null);
                    }}
                    className="text-[#4F5DF5] font-medium hover:underline"
                  >
                    Admin setup
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
