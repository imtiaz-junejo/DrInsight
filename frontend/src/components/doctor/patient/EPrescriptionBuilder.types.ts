export interface PrescriptionMed {
  name: string;
  strength: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  food: string;
  instructions: string;
  quantity: string;
  refill: string;
}

export interface PrescriptionPreviewData {
  rxNo: string;
  verifyId: string;
  issuedAt: string;
  status: string;
  digitalSignature?: string;
  consult: {
    consultId: string;
    apptId: string;
    doctorId: string;
    patientId: string;
    dateTime: string;
    status: string;
    type: string;
    followupRef: string;
  };
  doctor: {
    name: string;
    qualification: string;
    specialization: string;
    reg: string;
    signature: string;
  };
  patient: {
    name: string;
    id: string;
    age: string;
    gender: string;
    dob: string;
    height: string;
    weight: string;
    bmi: string;
    blood: string;
    phone: string;
    email: string;
    city: string;
    country: string;
    allergies: string;
    chronic: string;
    currentMeds: string;
    emergency: string;
  };
  summary: {
    reason: string;
    chiefComplaint: string;
    notes: string;
    symptomDuration: string;
    prevTreatment: string;
    prevConsultRef: string;
    reports: string[];
  };
  symptoms: {
    reported: string[];
    duration: string;
    severity: string;
    frequency: string;
    progression: string;
    associated: string;
    aggravating: string;
    relieving: string;
  };
  exam: {
    appearance: string;
    alertness: string;
    speech: string;
    respiratory: string;
    swelling: string;
    skin: string;
    temp: string;
    bp: string;
    sugar: string;
    spo2: string;
    hr: string;
    other: string;
    observations: string;
  };
  assessment: {
    provisional: string;
    differential: string;
    icd10: string;
    impression: string;
    risk: string;
  };
  investigations: string[];
  meds: PrescriptionMed[];
  advice: {
    diet: string;
    lifestyle: string;
    exercise: string;
    hydration: string;
    sleep: string;
    homeCare: string;
    isolation: string;
    warning: string;
    emergency: string;
  };
  followup: {
    required: string;
    date: string;
    after: string;
    type: string;
    referral: string;
    referralNotes: string;
  };
  doctorNotes: {
    text: string;
    includeInPatient: boolean;
  };
}
