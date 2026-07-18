import { DoctorProfile, OAuthProvider, PatientProfile, User, UserRole } from '@prisma/client';

export const PROFILE_FIELD_KEYS = [
  'accountSubType',
  'firstName',
  'lastName',
  'phone',
  'dateOfBirth',
  'gender',
  'city',
  'country',
  'emergencyContact',
  'healthInterests',
  'contentPreference',
  'newsletterFrequency',
  'languagePreference',
  'specialty',
  'licenseNumber',
  'regulatoryBody',
  'experienceYears',
  'clinicalInterests',
] as const;

export type ProfileFieldKey = (typeof PROFILE_FIELD_KEYS)[number];

type PatientSlice = Pick<
  PatientProfile,
  | 'dateOfBirth'
  | 'gender'
  | 'country'
  | 'city'
  | 'address'
  | 'accountSubType'
  | 'emergencyContact'
  | 'healthInterests'
  | 'contentPreference'
  | 'newsletterFrequency'
  | 'languagePreference'
> | null;

type DoctorSlice = Pick<
  DoctorProfile,
  | 'specialty'
  | 'licenseNumber'
  | 'credentials'
  | 'experienceYears'
  | 'expertise'
  | 'platformRole'
  | 'city'
  | 'country'
  | 'gender'
  | 'dateOfBirth'
> | null;

type UserSlice = Pick<User, 'firstName' | 'lastName' | 'phone' | 'role' | 'profileCompletedAt'>;

function isBlank(value?: string | null): boolean {
  return !value || !value.trim();
}

function isPlaceholderFirstName(value?: string | null): boolean {
  if (isBlank(value)) return true;
  return value!.trim().toLowerCase() === 'user';
}

export function getMissingProfileFields(
  user: UserSlice,
  patientProfile: PatientSlice,
  doctorProfile: DoctorSlice,
): ProfileFieldKey[] {
  if (user.profileCompletedAt) {
    return [];
  }

  const missing: ProfileFieldKey[] = [];
  const isDoctor = user.role === UserRole.DOCTOR;

  if (isDoctor) {
    if (isBlank(doctorProfile?.platformRole)) missing.push('accountSubType');
  } else if (isBlank(patientProfile?.accountSubType)) {
    missing.push('accountSubType');
  }

  if (isPlaceholderFirstName(user.firstName)) missing.push('firstName');
  if (isBlank(user.lastName)) missing.push('lastName');
  if (isBlank(user.phone)) missing.push('phone');

  if (isDoctor) {
    if (isBlank(doctorProfile?.specialty)) missing.push('specialty');
    if (isBlank(doctorProfile?.licenseNumber)) missing.push('licenseNumber');
    if (isBlank(doctorProfile?.credentials)) missing.push('regulatoryBody');
    if (doctorProfile?.experienceYears == null || doctorProfile.experienceYears < 0) {
      missing.push('experienceYears');
    }
    if (!doctorProfile?.expertise?.length) missing.push('clinicalInterests');
    if (isBlank(doctorProfile?.gender)) missing.push('gender');
    if (!doctorProfile?.dateOfBirth) missing.push('dateOfBirth');
    if (isBlank(doctorProfile?.city ?? patientProfile?.city)) missing.push('city');
    if (isBlank(doctorProfile?.country ?? patientProfile?.country)) missing.push('country');
    return missing;
  }

  if (!patientProfile?.dateOfBirth) missing.push('dateOfBirth');
  if (isBlank(patientProfile?.gender)) missing.push('gender');
  if (isBlank(patientProfile?.city)) missing.push('city');
  if (isBlank(patientProfile?.country)) missing.push('country');
  if (isBlank(patientProfile?.emergencyContact)) missing.push('emergencyContact');
  if (!patientProfile?.healthInterests?.length) missing.push('healthInterests');
  if (isBlank(patientProfile?.contentPreference)) missing.push('contentPreference');
  if (isBlank(patientProfile?.newsletterFrequency)) missing.push('newsletterFrequency');
  if (isBlank(patientProfile?.languagePreference)) missing.push('languagePreference');

  return missing;
}

export function isProfileComplete(
  user: UserSlice,
  patientProfile: PatientSlice,
  doctorProfile: DoctorSlice,
): boolean {
  return getMissingProfileFields(user, patientProfile, doctorProfile).length === 0;
}

export function normalizeOAuthProvider(provider?: OAuthProvider | null): 'google' | 'facebook' | null {
  if (provider === OAuthProvider.GOOGLE) return 'google';
  if (provider === OAuthProvider.FACEBOOK) return 'facebook';
  return null;
}

export const PHONE_PATTERN = /^\+?[0-9 ()-]{7,18}$/;

export function validatePhoneNumber(phone: string): boolean {
  const trimmed = phone.trim();
  if (!PHONE_PATTERN.test(trimmed)) return false;
  return trimmed.replace(/\D/g, '').length >= 10;
}

export function validateDateOfBirth(value: string): { valid: boolean; message?: string } {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { valid: false, message: 'Please enter a valid date of birth.' };
  }

  const now = new Date();
  if (parsed >= now) {
    return { valid: false, message: 'Date of birth must be in the past.' };
  }

  const minAgeDate = new Date();
  minAgeDate.setFullYear(minAgeDate.getFullYear() - 120);
  if (parsed < minAgeDate) {
    return { valid: false, message: 'Please enter a realistic date of birth.' };
  }

  const minPatientAge = new Date();
  minPatientAge.setFullYear(minPatientAge.getFullYear() - 1);
  if (parsed > minPatientAge) {
    return { valid: false, message: 'Patients must be at least 1 year old.' };
  }

  return { valid: true };
}

export const PROFILE_FIELD_LABELS: Record<ProfileFieldKey, string> = {
  accountSubType: 'Account sub-type',
  firstName: 'First name',
  lastName: 'Last name',
  phone: 'Phone number',
  dateOfBirth: 'Date of birth',
  gender: 'Gender',
  city: 'City',
  country: 'Country',
  emergencyContact: 'Emergency contact',
  healthInterests: 'Health interests',
  contentPreference: 'Preferred content type',
  newsletterFrequency: 'Newsletter frequency',
  languagePreference: 'Language preference',
  specialty: 'Specialization',
  licenseNumber: 'Medical license number',
  regulatoryBody: 'Regulatory body',
  experienceYears: 'Years of experience',
  clinicalInterests: 'Clinical interests',
};
