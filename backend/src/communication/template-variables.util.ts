const SAMPLE_VALUES: Record<string, string> = {
  '{{patientName}}': 'Ahmed Raza',
  '{{doctorName}}': 'Dr. Sarah Mitchell',
  '{{appointmentDate}}': 'June 13, 2026',
  '{{appointmentTime}}': '10:30 AM',
  '{{verificationCode}}': '482916',
  '{{resetLink}}': 'https://drinsight.org/reset-password?token=sample',
  '{{hospitalName}}': 'DrInsight',
  '{{otp}}': '482916',
  '{{otp_code}}': '482916',
  '{{userName}}': 'Ahmed Raza',
  '{{expiry}}': '10 minutes',
};

export function applyTemplateVariables(
  input: string,
  variables?: Record<string, string>,
): string {
  const merged = { ...SAMPLE_VALUES, ...variables };
  return Object.entries(merged).reduce(
    (result, [key, value]) => result.split(key).join(value),
    input,
  );
}

export function extractTemplateVariables(...inputs: string[]): string[] {
  const found = new Set<string>();
  const pattern = /\{\{[a-zA-Z0-9_]+\}\}/g;

  for (const input of inputs) {
    const matches = input.match(pattern) ?? [];
    matches.forEach((match) => found.add(match));
  }

  return Array.from(found);
}

export function generateOtp(length: number): string {
  const safeLength = Math.min(Math.max(length, 4), 8);
  const min = 10 ** (safeLength - 1);
  const max = 10 ** safeLength - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}
