import {useMutation} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Lock, UserCog} from 'lucide-react';
import {toast} from 'sonner';
import {usersApi} from '@/src/api/users';
import {Avatar} from '@/src/components/ui/Avatar';
import {useAuth} from '@/src/hooks/useAuth';
import {parseApiError} from '@/src/lib/errorParser';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your new password'),
  })
  .refine((vals) => vals.newPassword === vals.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const {user, refreshUser} = useAuth();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const profileMutation = useMutation({
    mutationFn: (vals: ProfileValues) => usersApi.updateMe(vals),
    onSuccess: async () => {
      await refreshUser();
      toast.success('Profile updated');
    },
    onError: (err) => {
      const parsed = parseApiError(err, 'Failed to update profile');
      toast.error(parsed.message);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (vals: PasswordValues) =>
      usersApi.changeMyPassword({
        currentPassword: vals.currentPassword,
        newPassword: vals.newPassword,
      }),
    onSuccess: () => {
      toast.success('Password changed successfully');
      passwordForm.reset();
    },
    onError: (err) => {
      const parsed = parseApiError(err, 'Failed to change password');
      toast.error(parsed.message);
      Object.entries(parsed.details).forEach(([field, msg]) => {
        if (field in passwordForm.getValues()) {
          passwordForm.setError(field as keyof PasswordValues, {message: msg});
        }
      });
    },
  });

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profile Details Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6">
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
          <Avatar name={user?.fullName} indexOrRole={user?.role} size="lg" />
          <div>
            <h2 className="font-display font-semibold text-base text-slate-900">
              {user?.fullName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              @{user?.username} · Role: {user?.role}
            </p>
          </div>
        </div>

        <form
          onSubmit={profileForm.handleSubmit((vals) => profileMutation.mutate(vals))}
          className="mt-5 space-y-4"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <UserCog className="w-4 h-4 text-[#4F5DF5]" />
            <span>Personal Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                {...profileForm.register('fullName')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
              {profileForm.formState.errors.fullName ? (
                <p className="mt-1 text-xs text-red-600">
                  {profileForm.formState.errors.fullName.message}
                </p>
              ) : null}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                {...profileForm.register('email')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
              {profileForm.formState.errors.email ? (
                <p className="mt-1 text-xs text-red-600">
                  {profileForm.formState.errors.email.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg disabled:opacity-50"
            >
              {profileMutation.isPending ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-4">
          <Lock className="w-4 h-4 text-[#4F5DF5]" />
          <span>Change Password</span>
        </div>

        <form
          onSubmit={passwordForm.handleSubmit((vals) => passwordMutation.mutate(vals))}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              {...passwordForm.register('currentPassword')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
            />
            {passwordForm.formState.errors.currentPassword ? (
              <p className="mt-1 text-xs text-red-600">
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                {...passwordForm.register('newPassword')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
              {passwordForm.formState.errors.newPassword ? (
                <p className="mt-1 text-xs text-red-600">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              ) : null}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                {...passwordForm.register('confirmPassword')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]"
              />
              {passwordForm.formState.errors.confirmPassword ? (
                <p className="mt-1 text-xs text-red-600">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4F5DF5] hover:bg-[#434EE4] rounded-lg disabled:opacity-50"
            >
              {passwordMutation.isPending ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
