import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {GraduationCap, Lock, Mail} from 'lucide-react';
import {toast} from 'sonner';
import {getRoleHomePath, useAuth} from '@/src/hooks/useAuth';
import {parseApiError} from '@/src/lib/errorParser';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const {login} = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {email: '', password: ''},
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      const loggedInUser = await login(values.email, values.password);
      toast.success('Signed in successfully');
      navigate(getRoleHomePath(loggedInUser.role), {replace: true});
    } catch (err) {
      const parsed = parseApiError(err, 'Invalid email or password');
      setFormError(parsed.message);
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
          <h1 className="font-display text-xl font-bold text-slate-900">Sign in to Scholara</h1>
          <p className="mt-1 text-xs text-slate-500">
            Sign in with your school email and password for Admin, Teacher, or Student access.
          </p>

          {formError ? (
            <div className="mt-4 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {formError}
            </div>
          ) : null}

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  autoComplete="email"
                  {...form.register('email')}
                  placeholder="name@school.edu"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
                />
              </div>
              {form.formState.errors.email ? (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  autoComplete="current-password"
                  {...form.register('password')}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
                />
              </div>
              {form.formState.errors.password ? (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg transition-colors disabled:opacity-50"
            >
              {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
