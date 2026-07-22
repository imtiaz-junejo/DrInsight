export function adminUserProfileHref(userId: string) {
  return `/admin/users/${userId}`;
}

export function adminDoctorProfileHref(doctorProfileId: string) {
  return `/admin/doctor-profiles/${doctorProfileId}`;
}

export function adminDoctorArticlesHref(userId: string) {
  return `/admin/users/${userId}/articles`;
}

export function adminAppointmentDetailHref(appointmentId: string) {
  return `/admin/appointments/${appointmentId}`;
}

export function adminBlogArticleHref(slug: string) {
  return `/admin/blog/${slug}`;
}
