import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {GraduationCap, Lock, Mail, User} from 'lucide-react';
import {toast} from 'sonner';
import {useAuth} from '@/src/hooks/useAuth';
import {parseApiError} from '@/src/lib/errorParser';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const {register: registerStudent} = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {fullName: '', username: '', email: '', password: ''},
  });

  const onSubmit = async (values: RegisterValues) => {
    setFormError(null);
    try {
      await registerStudent(values);
      toast.success('Student account created');
      navigate('/dashboard', {replace: true});
    } catch (err) {
      const parsed = parseApiError(err, 'Registration failed');
      setFormError(parsed.message);
      Object.entries(parsed.details).forEach(([field, msg]) => {
        if (field in values) {
          form.setError(field as keyof RegisterValues, {message: msg});
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
          <h1 className="font-display text-xl font-bold text-slate-900">Student Registration</h1>
          <p className="mt-1 text-xs text-slate-500">
            Register for a student portal account to view classes, attendance, and grades.
          </p>

          {formError ? (
            <div className="mt-4 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {formError}
            </div>
          ) : null}

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...form.register('fullName')}
                  placeholder="Alex Rivera"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
                />
              </div>
              {form.formState.errors.fullName ? (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.fullName.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                {...form.register('username')}
                placeholder="alex.rivera"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
              {form.formState.errors.username ? (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.username.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  {...form.register('email')}
                  placeholder="alex.rivera@student.scholara.edu"
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
                  {...form.register('password')}
                  placeholder="Minimum 6 characters"
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
              {form.formState.isSubmitting ? 'Creating account...' : 'Create Student Account'}
            </button>
          </form>

          <p className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#4F5DF5] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
