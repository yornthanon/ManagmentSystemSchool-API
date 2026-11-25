const AVATAR_PATHS = [
  '/src/assets/images/avatar_admin_principal_1795481625836.jpg',
  '/src/assets/images/avatar_teacher_portrait_1795481626578.jpg',
  '/src/assets/images/avatar_student_male_1795481625800.jpg',
  '/src/assets/images/avatar_student_female_1795481626640.jpg',
];

export function getAvatarUrl(indexOrRole?: number | string): string {
  if (typeof indexOrRole === 'number') {
    const idx = Math.abs(indexOrRole) % AVATAR_PATHS.length;
    return AVATAR_PATHS[idx];
  }
  if (indexOrRole === 'ADMIN') return AVATAR_PATHS[0];
  if (indexOrRole === 'TEACHER') return AVATAR_PATHS[1];
  return AVATAR_PATHS[2];
}

export function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
