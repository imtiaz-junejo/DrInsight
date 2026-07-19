"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { DoctorIconComponent } from "@/components/doctor/icons/DoctorIcons";
import {
  AlertTriangle,
  BadgeCheck,
  ClipboardList,
  Copy,
  DoctorIcon,
  DoctorIconInline,
  Eye,
  FileText,
  FlaskConical,
  Link,
  Lock,
  Pill,
  RotateCw,
  Save,
  Stethoscope,
  UserRound,
  Video,
  X,
} from "@/components/doctor/icons/DoctorIcons";
import {
  useDoctorProfile,
  useIssuePrescription,
  usePatientDetail,
  usePatientPrescriptions,
  usePrescriptionDraft,
  useSavePrescriptionDraft,
  type Prescription,
} from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import { doctorDisplayName, formatDateTime } from "@/lib/doctor-utils";
import {
  formatDoctorPrescriptionId,
  formatPatientDisplayId,
  formatPatientPrescriptionId,
} from "@/lib/member-ids";
import "@/styles/e-prescription.css";
import type { PrescriptionMed, PrescriptionPreviewData } from "./EPrescriptionBuilder.types";

export type { PrescriptionMed, PrescriptionPreviewData } from "./EPrescriptionBuilder.types";

export const COMMON_MEDS = [
  "Amlodipine",
  "Atorvastatin",
  "Metformin",
  "Losartan",
  "Lisinopril",
  "Bisoprolol",
  "Carvedilol",
  "Furosemide",
  "Aspirin",
  "Clopidogrel",
  "Ramipril",
  "Telmisartan",
  "Hydrochlorothiazide",
  "Amoxicillin",
  "Azithromycin",
  "Omeprazole",
  "Paracetamol",
  "Ibuprofen",
  "Sumatriptan",
  "Naproxen",
  "Cetirizine",
  "Salbutamol",
  "Levothyroxine",
  "Warfarin",
  "Ticagrelor",
];

export const SYMPTOMS = [
  "Fever",
  "Cough",
  "Headache",
  "Chest pain",
  "Breathlessness",
  "Fatigue",
  "Palpitations",
  "Dizziness",
  "Nausea",
  "Swelling (oedema)",
  "Abdominal pain",
  "Sore throat",
];

export const INVESTIGATIONS = [
  "CBC",
  "LFT",
  "RFT",
  "HbA1c",
  "Lipid Profile",
  "ECG",
  "Chest X-Ray",
  "CT Scan",
  "MRI",
  "Ultrasound",
  "Urine Analysis",
  "NT-proBNP",
  "TSH",
  "Serum Electrolytes",
];

const MED_ROUTES = [
  "Oral",
  "Sublingual",
  "Topical",
  "Inhaled",
  "Injection (IM)",
  "Injection (IV)",
  "Nasal",
  "Ophthalmic",
];

const FOOD_OPTIONS = ["", "Before food", "After food", "With food", "Empty stomach", "Either"];

function RxCardIcon({ icon }: { icon: DoctorIconComponent }) {
  return (
    <div className="ic">
      <DoctorIcon icon={icon} size="button" />
    </div>
  );
}

interface MedRow extends PrescriptionMed {
  id: string;
}

function rxStamp(date = new Date()): string {
  return (
    date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " +
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}

function patientAge(dob?: string | null): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "—";
  const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return String(age);
}

function genderLabel(g?: string | null): string {
  if (!g) return "—";
  const lower = g.toLowerCase();
  if (lower === "m" || lower === "male") return "Male";
  if (lower === "f" || lower === "female") return "Female";
  return g;
}

function emptyMed(): MedRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    strength: "",
    dosage: "",
    frequency: "",
    route: "Oral",
    duration: "",
    food: "",
    instructions: "",
    quantity: "",
    refill: "",
  };
}

function mapIssuedToPreview(base: PrescriptionPreviewData, issued: Prescription): PrescriptionPreviewData {
  return {
    ...base,
    rxNo: issued.prescriptionNumber ?? base.rxNo,
    verifyId: issued.verifyId ?? base.verifyId,
    status: issued.status ?? "Pending Review",
    issuedAt: issued.issuedAt ? formatDateTime(issued.issuedAt) : base.issuedAt,
    digitalSignature: issued.digitalSignature ?? base.digitalSignature,
  };
}

export function EPrescriptionBuilder({
  patientId,
  patientName,
  patientCode,
  onPreview,
}: {
  patientId: string;
  patientName: string;
  patientCode: string;
  onPreview: (rx: PrescriptionPreviewData) => void;
}) {
  const closePatientPanel = useDoctorUiStore((s) => s.closePatientPanel);
  const showToast = useDoctorUiStore((s) => s.showToast);

  const patientQuery = usePatientDetail(patientId);
  const doctorQuery = useDoctorProfile();
  const draftQuery = usePrescriptionDraft(patientId);
  const saveDraft = useSavePrescriptionDraft();
  const issuePrescription = useIssuePrescription();
  const patientRxQuery = usePatientPrescriptions(patientId);

  const [mounted, setMounted] = useState(false);
  const [saveState, setSaveState] = useState("All changes saved");
  const [footStatus, setFootStatus] = useState("Draft · not yet issued");
  const draftLoaded = useRef(false);

  const latestConsult = useMemo(() => {
    const history = patientQuery.data?.consultationHistory ?? [];
    const withoutRx = history.filter((h) => !h.hasPrescription);
    const pool = withoutRx.length > 0 ? withoutRx : history;
    return [...pool].sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    )[0];
  }, [patientQuery.data?.consultationHistory]);

  const consultId = latestConsult?.id ? `CONS-${latestConsult.id.slice(0, 8).toUpperCase()}` : "—";
  const apptId = latestConsult?.id ?? "—";
  const consultDateTime = latestConsult ? formatDateTime(latestConsult.scheduledAt) : rxStamp();

  const doctorUser = doctorQuery.data?.user;
  const doctorName = doctorDisplayName(doctorUser?.firstName, doctorUser?.lastName);
  const doctorSpec = doctorQuery.data?.specialty ?? "";
  const doctorQual =
    doctorQuery.data?.credentials ??
    [doctorQuery.data?.professionalTitle, doctorQuery.data?.education].filter(Boolean).join(", ") ??
    "";
  const doctorReg = doctorQuery.data?.licenseNumber ?? "—";

  const patient = patientQuery.data;
  const resolvedPatientDisplayId = useMemo(
    () => formatPatientDisplayId(patient?.patientNumber, patientId),
    [patient?.patientNumber, patientId],
  );
  const resolvedPatientRxId = useMemo(
    () => formatPatientPrescriptionId(patient?.patientNumber, patientId),
    [patient?.patientNumber, patientId],
  );
  const resolvedDoctorRxId = useMemo(
    () => formatDoctorPrescriptionId(doctorQuery.data?.doctorNumber, doctorQuery.data?.id),
    [doctorQuery.data?.doctorNumber, doctorQuery.data?.id],
  );
  const defaultAllergies = patient?.allergies?.length ? patient.allergies.join(", ") : "None reported";
  const defaultCurrentMeds =
    patient?.medications?.map((m) => `${m.name}${m.dosage ? ` ${m.dosage}` : ""}`).join(", ") || "None";

  const [consultType, setConsultType] = useState("Video");
  const [followupRef, setFollowupRef] = useState("");
  const [pName, setPName] = useState(patientName);
  const [pAge, setPAge] = useState("");
  const [pGender, setPGender] = useState("");
  const [pBlood, setPBlood] = useState("");
  const [pWeight, setPWeight] = useState("");
  const [pBmi, setPBmi] = useState("");
  const [pAllergies, setPAllergies] = useState(defaultAllergies);
  const [pCurrentMeds, setPCurrentMeds] = useState(defaultCurrentMeds);

  const [reason, setReason] = useState("");
  const [symptomDuration, setSymptomDuration] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [consultNotes, setConsultNotes] = useState("");
  const [prevTreatment, setPrevTreatment] = useState("");

  const [reportedSymptoms, setReportedSymptoms] = useState<string[]>([]);
  const [symSeverity, setSymSeverity] = useState("");
  const [symFrequency, setSymFrequency] = useState("");
  const [symProgression, setSymProgression] = useState("");
  const [symAssociated, setSymAssociated] = useState("");
  const [symAggravating, setSymAggravating] = useState("");
  const [symRelieving, setSymRelieving] = useState("");

  const [examAppearance, setExamAppearance] = useState("");
  const [examAlertness, setExamAlertness] = useState("Alert & oriented");
  const [examRespiratory, setExamRespiratory] = useState("None");
  const [examTemp, setExamTemp] = useState("");
  const [examBp, setExamBp] = useState("");
  const [examSpo2, setExamSpo2] = useState("");
  const [examHr, setExamHr] = useState("");
  const [examSugar, setExamSugar] = useState("");
  const [examSwelling, setExamSwelling] = useState("");
  const [examObservations, setExamObservations] = useState("");

  const [provisionalDx, setProvisionalDx] = useState("");
  const [icd10, setIcd10] = useState("");
  const [differentialDx, setDifferentialDx] = useState("");
  const [riskAssessment, setRiskAssessment] = useState("");
  const [clinicalImpression, setClinicalImpression] = useState("");

  const [selectedInvestigations, setSelectedInvestigations] = useState<string[]>([]);
  const [customInvestigations, setCustomInvestigations] = useState<string[]>([]);
  const [invCustomInput, setInvCustomInput] = useState("");

  const [meds, setMeds] = useState<MedRow[]>([emptyMed()]);

  const [adDiet, setAdDiet] = useState("");
  const [adLifestyle, setAdLifestyle] = useState("");
  const [adExercise, setAdExercise] = useState("");
  const [adHydration, setAdHydration] = useState("");
  const [adSleep, setAdSleep] = useState("");
  const [adHomeCare, setAdHomeCare] = useState("");
  const [adIsolation, setAdIsolation] = useState("");
  const [adWarning, setAdWarning] = useState("");
  const [adEmergency, setAdEmergency] = useState("");

  const [fupRequired, setFupRequired] = useState("Yes");
  const [fupAfter, setFupAfter] = useState("");
  const [fupDate, setFupDate] = useState("");
  const [fupType, setFupType] = useState("Video");
  const [fupReferral, setFupReferral] = useState("");
  const [fupReferralNotes, setFupReferralNotes] = useState("");

  const [privateNotes, setPrivateNotes] = useState("");
  const [includePrivateInPatient, setIncludePrivateInPatient] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!patient) return;
    setPName(`${patient.user.firstName} ${patient.user.lastName}`.trim() || patientName);
    setPAge(patientAge(patient.dateOfBirth));
    setPGender(genderLabel(patient.gender));
    setPBlood(patient.bloodGroup ?? "—");
    setPAllergies(patient.allergies?.length ? patient.allergies.join(", ") : "None reported");
    setPCurrentMeds(
      patient.medications?.map((m) => `${m.name}${m.dosage ? ` ${m.dosage}` : ""}`).join(", ") || "None",
    );
    setReason(patient.condition ?? "");
    setProvisionalDx(patient.condition ?? "");
    if (latestConsult) {
      setConsultType(latestConsult.consultationType || "Video");
      setReason(latestConsult.reason ?? patient.condition ?? "");
    }
  }, [patient, patientName, latestConsult]);

  const applyDraft = useCallback((data: Record<string, unknown>) => {
    if (data.sourcePrescriptionId) {
      if (typeof data.diagnosis === "string") setProvisionalDx(data.diagnosis);
      if (typeof data.notes === "string") {
        setPrivateNotes(data.notes);
        setConsultNotes(data.notes);
      }
      if (Array.isArray(data.items)) {
        const duplicated = (data.items as Array<Record<string, string>>).map((item) => ({
          ...emptyMed(),
          id: crypto.randomUUID(),
          name: item.medication ?? item.name ?? "",
          strength: item.strength ?? "",
          dosage: item.dosage ?? "",
          frequency: item.frequency ?? "",
          route: item.route ?? "Oral",
          duration: item.duration ?? "",
          food: item.food ?? "",
          instructions: item.instructions ?? "",
          quantity: item.quantity ?? "",
          refill: item.refill ?? "",
        }));
        if (duplicated.length) setMeds(duplicated);
      }
      const ext = data.extendedData as Partial<PrescriptionPreviewData> | undefined;
      if (ext && typeof ext === "object") {
        if (ext.summary?.reason) setReason(ext.summary.reason);
        if (ext.summary?.chiefComplaint) setChiefComplaint(ext.summary.chiefComplaint);
        if (ext.summary?.notes) setConsultNotes(ext.summary.notes);
        if (ext.summary?.symptomDuration) setSymptomDuration(ext.summary.symptomDuration);
        if (ext.assessment?.provisional) setProvisionalDx(ext.assessment.provisional);
        if (ext.assessment?.differential) setDifferentialDx(ext.assessment.differential);
        if (ext.assessment?.icd10) setIcd10(ext.assessment.icd10);
        if (ext.assessment?.impression) setClinicalImpression(ext.assessment.impression);
        if (ext.assessment?.risk) setRiskAssessment(ext.assessment.risk);
        if (ext.symptoms?.reported?.length) setReportedSymptoms(ext.symptoms.reported);
        if (ext.investigations?.length) setSelectedInvestigations(ext.investigations);
        if (ext.meds?.length) {
          setMeds(ext.meds.map((m) => ({ ...emptyMed(), ...m, id: crypto.randomUUID() })));
        }
        if (ext.advice?.diet) setAdDiet(ext.advice.diet);
        if (ext.advice?.lifestyle) setAdLifestyle(ext.advice.lifestyle);
        if (ext.advice?.exercise) setAdExercise(ext.advice.exercise);
        if (ext.advice?.warning) setAdWarning(ext.advice.warning);
        if (ext.followup?.date) setFupDate(ext.followup.date);
        if (ext.doctorNotes?.text) setPrivateNotes(ext.doctorNotes.text);
        return;
      }
    }

    const str = (key: string, fallback = "") => (typeof data[key] === "string" ? (data[key] as string) : fallback);
    const arr = (key: string) => (Array.isArray(data[key]) ? (data[key] as string[]) : []);

    setConsultType(str("consultType", "Video"));
    setFollowupRef(str("followupRef"));
    setPName(str("pName", patientName));
    setPAge(str("pAge"));
    setPGender(str("pGender"));
    setPBlood(str("pBlood"));
    setPWeight(str("pWeight"));
    setPBmi(str("pBmi"));
    setPAllergies(str("pAllergies", defaultAllergies));
    setPCurrentMeds(str("pCurrentMeds", defaultCurrentMeds));
    setReason(str("reason"));
    setSymptomDuration(str("symptomDuration"));
    setChiefComplaint(str("chiefComplaint"));
    setConsultNotes(str("consultNotes"));
    setPrevTreatment(str("prevTreatment"));
    setReportedSymptoms(arr("reportedSymptoms"));
    setSymSeverity(str("symSeverity"));
    setSymFrequency(str("symFrequency"));
    setSymProgression(str("symProgression"));
    setSymAssociated(str("symAssociated"));
    setSymAggravating(str("symAggravating"));
    setSymRelieving(str("symRelieving"));
    setExamAppearance(str("examAppearance"));
    setExamAlertness(str("examAlertness", "Alert & oriented"));
    setExamRespiratory(str("examRespiratory", "None"));
    setExamTemp(str("examTemp"));
    setExamBp(str("examBp"));
    setExamSpo2(str("examSpo2"));
    setExamHr(str("examHr"));
    setExamSugar(str("examSugar"));
    setExamSwelling(str("examSwelling"));
    setExamObservations(str("examObservations"));
    setProvisionalDx(str("provisionalDx"));
    setIcd10(str("icd10"));
    setDifferentialDx(str("differentialDx"));
    setRiskAssessment(str("riskAssessment"));
    setClinicalImpression(str("clinicalImpression"));
    setSelectedInvestigations(arr("selectedInvestigations"));
    setCustomInvestigations(arr("customInvestigations"));
    const draftMeds = Array.isArray(data.meds) ? (data.meds as PrescriptionMed[]) : [];
    if (draftMeds.length) {
      setMeds(draftMeds.map((m) => ({ ...emptyMed(), ...m, id: crypto.randomUUID() })));
    }
    setAdDiet(str("adDiet"));
    setAdLifestyle(str("adLifestyle"));
    setAdExercise(str("adExercise"));
    setAdHydration(str("adHydration"));
    setAdSleep(str("adSleep"));
    setAdHomeCare(str("adHomeCare"));
    setAdIsolation(str("adIsolation"));
    setAdWarning(str("adWarning"));
    setAdEmergency(str("adEmergency"));
    setFupRequired(str("fupRequired", "Yes"));
    setFupAfter(str("fupAfter"));
    setFupDate(str("fupDate"));
    setFupType(str("fupType", "Video"));
    setFupReferral(str("fupReferral"));
    setFupReferralNotes(str("fupReferralNotes"));
    setPrivateNotes(str("privateNotes"));
    setIncludePrivateInPatient(Boolean(data.includePrivateInPatient));
  }, [patientName, defaultAllergies, defaultCurrentMeds]);

  useEffect(() => {
    if (draftLoaded.current || !draftQuery.data?.data) return;
    applyDraft(draftQuery.data.data);
    draftLoaded.current = true;
  }, [draftQuery.data, applyDraft]);

  const draftPayload = useMemo(
    () => ({
      consultType,
      followupRef,
      pName,
      pAge,
      pGender,
      pBlood,
      pWeight,
      pBmi,
      pAllergies,
      pCurrentMeds,
      reason,
      symptomDuration,
      chiefComplaint,
      consultNotes,
      prevTreatment,
      reportedSymptoms,
      symSeverity,
      symFrequency,
      symProgression,
      symAssociated,
      symAggravating,
      symRelieving,
      examAppearance,
      examAlertness,
      examRespiratory,
      examTemp,
      examBp,
      examSpo2,
      examHr,
      examSugar,
      examSwelling,
      examObservations,
      provisionalDx,
      icd10,
      differentialDx,
      riskAssessment,
      clinicalImpression,
      selectedInvestigations,
      customInvestigations,
      meds: meds.map(({ id: _id, ...m }) => m),
      adDiet,
      adLifestyle,
      adExercise,
      adHydration,
      adSleep,
      adHomeCare,
      adIsolation,
      adWarning,
      adEmergency,
      fupRequired,
      fupAfter,
      fupDate,
      fupType,
      fupReferral,
      fupReferralNotes,
      privateNotes,
      includePrivateInPatient,
    }),
    [
      consultType,
      followupRef,
      pName,
      pAge,
      pGender,
      pBlood,
      pWeight,
      pBmi,
      pAllergies,
      pCurrentMeds,
      reason,
      symptomDuration,
      chiefComplaint,
      consultNotes,
      prevTreatment,
      reportedSymptoms,
      symSeverity,
      symFrequency,
      symProgression,
      symAssociated,
      symAggravating,
      symRelieving,
      examAppearance,
      examAlertness,
      examRespiratory,
      examTemp,
      examBp,
      examSpo2,
      examHr,
      examSugar,
      examSwelling,
      examObservations,
      provisionalDx,
      icd10,
      differentialDx,
      riskAssessment,
      clinicalImpression,
      selectedInvestigations,
      customInvestigations,
      meds,
      adDiet,
      adLifestyle,
      adExercise,
      adHydration,
      adSleep,
      adHomeCare,
      adIsolation,
      adWarning,
      adEmergency,
      fupRequired,
      fupAfter,
      fupDate,
      fupType,
      fupReferral,
      fupReferralNotes,
      privateNotes,
      includePrivateInPatient,
    ],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSaveState("Saving…");
      saveDraft.mutate(
        {
          patientId,
          body: {
            appointmentId: latestConsult?.id,
            data: draftPayload,
          },
        },
        {
          onSuccess: () => setSaveState("Draft auto-saved"),
          onError: () => setSaveState("Auto-save failed"),
        },
      );
    }, 1200);
    return () => clearTimeout(timer);
  }, [draftPayload, patientId, latestConsult?.id, saveDraft]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const toggleSymptom = (symptom: string) => {
    setReportedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    );
  };

  const toggleInvestigation = (inv: string) => {
    setSelectedInvestigations((prev) =>
      prev.includes(inv) ? prev.filter((i) => i !== inv) : [...prev, inv],
    );
  };

  const addCustomInvestigation = () => {
    const value = invCustomInput.trim();
    if (!value || customInvestigations.includes(value)) return;
    setCustomInvestigations((prev) => [...prev, value]);
    setInvCustomInput("");
  };

  const updateMed = (id: string, patch: Partial<MedRow>) => {
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const removeMed = (id: string) => {
    setMeds((prev) => (prev.length <= 1 ? prev : prev.filter((m) => m.id !== id)));
  };

  const addMed = () => setMeds((prev) => [...prev, emptyMed()]);

  const duplicatePrevious = () => {
    const latest = patientRxQuery.data?.[0];
    if (!latest?.items?.length) {
      showToast("No previous prescriptions on file");
      return;
    }
    setMeds(
      latest.items.map((item) => ({
        ...emptyMed(),
        name: item.medication,
        strength: item.strength ?? "",
        dosage: item.dosage,
        frequency: item.frequency,
        route: item.route ?? "Oral",
        duration: item.duration,
        food: item.food ?? "",
        instructions: item.instructions ?? "",
        quantity: item.quantity ?? "",
        refill: item.refill ?? "",
      })),
    );
    showToast("📑 Copied previous prescription medications");
  };

  const buildPreview = useCallback(
    (status: string, overrides?: Partial<PrescriptionPreviewData>): PrescriptionPreviewData => {
      const activeMeds = meds
        .filter((m) => m.name.trim())
        .map(({ id: _id, ...m }) => m);
      const investigations = [...selectedInvestigations, ...customInvestigations];
      const signature = doctorName.replace(/^Dr\.?\s*/i, "");

      return {
        rxNo: `DRX-PREVIEW-${Date.now().toString(36).toUpperCase()}`,
        verifyId: `VF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        issuedAt: rxStamp(),
        status,
        digitalSignature: signature,
        consult: {
          consultId,
          apptId,
          doctorId: resolvedDoctorRxId,
          patientId: resolvedPatientRxId,
          dateTime: consultDateTime,
          status: latestConsult?.status ?? "Completed",
          type: consultType,
          followupRef: followupRef || "—",
        },
        doctor: {
          name: doctorName,
          qualification: doctorQual || "—",
          specialization: doctorSpec || "—",
          reg: doctorReg,
          signature,
        },
        patient: {
          name: pName,
          id: resolvedPatientDisplayId,
          age: pAge,
          gender: pGender,
          dob: patient?.dateOfBirth ? formatDateTime(patient.dateOfBirth).split("·")[0]?.trim() ?? "—" : "—",
          height: "—",
          weight: pWeight || "—",
          bmi: pBmi || "—",
          blood: pBlood || "—",
          phone: patient?.user.phone ?? patient?.user.email ?? "—",
          email: patient?.user.email ?? "—",
          city: "—",
          country: "Pakistan",
          allergies: pAllergies || "None reported",
          chronic: patient?.medicalHistory ?? "None reported",
          currentMeds: pCurrentMeds || "None",
          emergency: patient?.emergencyContact ?? "—",
        },
        summary: {
          reason,
          chiefComplaint,
          notes: consultNotes,
          symptomDuration,
          prevTreatment,
          prevConsultRef: "—",
          reports: [],
        },
        symptoms: {
          reported: reportedSymptoms,
          duration: symptomDuration,
          severity: symSeverity,
          frequency: symFrequency,
          progression: symProgression,
          associated: symAssociated,
          aggravating: symAggravating,
          relieving: symRelieving,
        },
        exam: {
          appearance: examAppearance,
          alertness: examAlertness,
          speech: "",
          respiratory: examRespiratory,
          swelling: examSwelling,
          skin: "",
          temp: examTemp,
          bp: examBp,
          sugar: examSugar,
          spo2: examSpo2,
          hr: examHr,
          other: "",
          observations: examObservations,
        },
        assessment: {
          provisional: provisionalDx,
          differential: differentialDx,
          icd10,
          impression: clinicalImpression,
          risk: riskAssessment,
        },
        investigations,
        meds: activeMeds,
        advice: {
          diet: adDiet,
          lifestyle: adLifestyle,
          exercise: adExercise,
          hydration: adHydration,
          sleep: adSleep,
          homeCare: adHomeCare,
          isolation: adIsolation,
          warning: adWarning,
          emergency: adEmergency,
        },
        followup: {
          required: fupRequired,
          date: fupDate,
          after: fupAfter,
          type: fupType,
          referral: fupReferral,
          referralNotes: fupReferralNotes,
        },
        doctorNotes: {
          text: privateNotes,
          includeInPatient: includePrivateInPatient,
        },
        ...overrides,
      };
    },
    [
      meds,
      selectedInvestigations,
      customInvestigations,
      doctorName,
      consultId,
      apptId,
      doctorQuery.data?.id,
      patientCode,
      resolvedPatientDisplayId,
      resolvedPatientRxId,
      resolvedDoctorRxId,
      consultDateTime,
      latestConsult?.status,
      consultType,
      followupRef,
      doctorQual,
      doctorSpec,
      doctorReg,
      pName,
      pAge,
      pGender,
      patient,
      pWeight,
      pBmi,
      pBlood,
      pAllergies,
      pCurrentMeds,
      reason,
      chiefComplaint,
      consultNotes,
      symptomDuration,
      prevTreatment,
      reportedSymptoms,
      symSeverity,
      symFrequency,
      symProgression,
      symAssociated,
      symAggravating,
      symRelieving,
      examAppearance,
      examAlertness,
      examRespiratory,
      examSwelling,
      examTemp,
      examBp,
      examSugar,
      examSpo2,
      examHr,
      examObservations,
      provisionalDx,
      differentialDx,
      icd10,
      clinicalImpression,
      riskAssessment,
      adDiet,
      adLifestyle,
      adExercise,
      adHydration,
      adSleep,
      adHomeCare,
      adIsolation,
      adWarning,
      adEmergency,
      fupRequired,
      fupDate,
      fupAfter,
      fupType,
      fupReferral,
      fupReferralNotes,
      privateNotes,
      includePrivateInPatient,
    ],
  );

  const validate = () => {
    const activeMeds = meds.filter((m) => m.name.trim());
    if (!activeMeds.length) {
      showToast("⚠️ Add at least one medication before finalizing");
      return false;
    }
    if (!provisionalDx.trim()) {
      showToast("⚠️ Provisional diagnosis is required");
      return false;
    }
    return true;
  };

  const issueBody = useCallback(() => {
    const activeMeds = meds.filter((m) => m.name.trim());
    return {
      appointmentId: latestConsult?.id,
      diagnosis: provisionalDx.trim(),
      items: activeMeds.map((m) => ({
        medication: m.name.trim(),
        strength: m.strength,
        dosage: m.dosage,
        frequency: m.frequency,
        route: m.route,
        duration: m.duration,
        food: m.food,
        instructions: m.instructions,
        quantity: m.quantity,
        refill: m.refill,
      })),
      notes: privateNotes || consultNotes || undefined,
      followUpDate: fupDate || undefined,
      digitalSignature: doctorName.replace(/^Dr\.?\s*/i, ""),
      extendedData: buildPreview("Draft"),
      status: "PENDING_REVIEW",
    };
  }, [
    meds,
    latestConsult?.id,
    provisionalDx,
    privateNotes,
    consultNotes,
    fupDate,
    doctorName,
    buildPreview,
  ]);

  const handleSaveDraft = () => {
    saveDraft.mutate(
      { patientId, body: { appointmentId: latestConsult?.id, data: draftPayload } },
      {
        onSuccess: () => {
          setFootStatus(`Draft saved · ${rxStamp()}`);
          showToast("💾 Draft saved");
        },
        onError: () => showToast("Failed to save draft"),
      },
    );
  };

  const handlePreview = () => {
    onPreview(buildPreview("Finalized"));
  };

  const handleFinalize = async () => {
    if (!validate()) return;
    try {
      const preview = buildPreview("Pending Review");
      const issued = await issuePrescription.mutateAsync({
        patientId,
        body: issueBody(),
      });
      onPreview(mapIssuedToPreview(preview, issued));
      showToast("✓ Prescription finalized & sent — awaiting admin approval");
      closePatientPanel();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : null;
      const text = Array.isArray(message) ? message[0] : message;
      showToast(text ?? "Failed to issue prescription");
    }
  };

  const handleClose = () => closePatientPanel();

  if (!mounted) return null;

  return createPortal(
    <div id="rxBuild" className="open">
      <div className="rxb-bar">
        <div className="rxb-ttl">
          <DoctorIconInline icon={Pill} size="button">
            New e-Prescription
          </DoctorIconInline>{" "}
          <small>{pName} · {resolvedPatientDisplayId}</small>
        </div>
        <div className="rxb-save">
          <span className="rxb-dot" />
          <span>{saveState}</span>
        </div>
        <button type="button" className="rx-vw-btn x" onClick={handleClose}>
          <DoctorIcon icon={X} size="sm" label="Close" />
        </button>
      </div>

      <div className="rxb-wrap">
        <div className="rxb-card">
          <div className="rxb-h">
            <RxCardIcon icon={Link} />
            <h4>Consultation Link</h4>
            <span className="rxb-auto">Auto-filled</span>
          </div>
          <div className="rxb-fg g3">
            <div className="rxb-f">
              <label>Consultation ID</label>
              <input value={consultId} readOnly />
            </div>
            <div className="rxb-f">
              <label>Appointment ID</label>
              <input value={apptId} readOnly />
            </div>
            <div className="rxb-f">
              <label>Date &amp; Time</label>
              <input value={consultDateTime} readOnly />
            </div>
            <div className="rxb-f">
              <label>Consultation Type</label>
              <select value={consultType} onChange={(e) => setConsultType(e.target.value)}>
                <option>Video</option>
                <option>Audio</option>
                <option>Chat</option>
              </select>
            </div>
            <div className="rxb-f">
              <label>Status</label>
              <input value={latestConsult?.status ?? "Completed"} readOnly />
            </div>
            <div className="rxb-f">
              <label>Follow-up Ref (optional)</label>
              <input
                value={followupRef}
                onChange={(e) => setFollowupRef(e.target.value)}
                placeholder="e.g. CONS-58110"
              />
            </div>
          </div>
        </div>

        <div className="rxb-card">
          <div className="rxb-h">
            <RxCardIcon icon={Stethoscope} />
            <h4>Prescribing Physician</h4>
            <span className="rxb-auto">Auto-filled</span>
          </div>
          <div className="rxb-fg">
            <div className="rxb-f">
              <label>Doctor Name</label>
              <input value={doctorName} readOnly />
            </div>
            <div className="rxb-f">
              <label>Specialization</label>
              <input value={doctorSpec} readOnly />
            </div>
            <div className="rxb-f">
              <label>Qualification</label>
              <input value={doctorQual} readOnly />
            </div>
            <div className="rxb-f">
              <label>Reg. No (PMDC)</label>
              <input value={doctorReg} readOnly />
            </div>
          </div>
        </div>

        <div className="rxb-card">
          <div className="rxb-h">
            <RxCardIcon icon={UserRound} />
            <h4>Patient Information</h4>
            <span className="rxb-auto">Auto-filled · editable for this consult</span>
          </div>
          <div className="rxb-fg g3">
            <div className="rxb-f">
              <label>Full Name</label>
              <input value={pName} onChange={(e) => setPName(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Age</label>
              <input value={pAge} onChange={(e) => setPAge(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Gender</label>
              <input value={pGender} onChange={(e) => setPGender(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Blood Group</label>
              <input value={pBlood} onChange={(e) => setPBlood(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Weight</label>
              <input value={pWeight} onChange={(e) => setPWeight(e.target.value)} placeholder="e.g. 68 kg" />
            </div>
            <div className="rxb-f">
              <label>BMI</label>
              <input value={pBmi} onChange={(e) => setPBmi(e.target.value)} placeholder="e.g. 27.1 kg/m²" />
            </div>
            <div className="rxb-f full">
              <label>Allergies</label>
              <input value={pAllergies} onChange={(e) => setPAllergies(e.target.value)} />
            </div>
            <div className="rxb-f full">
              <label>Current Medications</label>
              <input value={pCurrentMeds} onChange={(e) => setPCurrentMeds(e.target.value)} />
            </div>
          </div>
          <div className="rxb-hint">Edits here apply to this prescription only — the patient master profile is unchanged.</div>
        </div>

        <div className="rxb-card">
          <div className="rxb-h">
            <RxCardIcon icon={ClipboardList} />
            <h4>Consultation Summary</h4>
          </div>
          <div className="rxb-fg">
            <div className="rxb-f">
              <label>Reason for Consultation</label>
              <input value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Symptom Duration</label>
              <input value={symptomDuration} onChange={(e) => setSymptomDuration(e.target.value)} placeholder="e.g. 5 days" />
            </div>
          </div>
          <div className="rxb-fg g1" style={{ marginTop: 11 }}>
            <div className="rxb-f">
              <label>Chief Complaint</label>
              <textarea value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Consultation Notes</label>
              <textarea value={consultNotes} onChange={(e) => setConsultNotes(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Previous Treatment</label>
              <input value={prevTreatment} onChange={(e) => setPrevTreatment(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rxb-card">
          <div className="rxb-h">
            <RxCardIcon icon={AlertTriangle} />
            <h4>Symptoms</h4>
          </div>
          <label className="rxb-f" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: ".66rem", fontWeight: 700, color: "var(--rx-muted)", letterSpacing: ".3px", textTransform: "uppercase" }}>
              Reported symptoms
            </span>
          </label>
          <div className="rxb-chips">
            {SYMPTOMS.map((symptom) => (
              <button
                key={symptom}
                type="button"
                className={`rxb-chip${reportedSymptoms.includes(symptom) ? " on" : ""}`}
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </button>
            ))}
          </div>
          <div className="rxb-fg g3" style={{ marginTop: 12 }}>
            <div className="rxb-f">
              <label>Severity</label>
              <select value={symSeverity} onChange={(e) => setSymSeverity(e.target.value)}>
                <option value="">—</option>
                <option>Mild</option>
                <option>Moderate</option>
                <option>Severe</option>
              </select>
            </div>
            <div className="rxb-f">
              <label>Frequency</label>
              <input value={symFrequency} onChange={(e) => setSymFrequency(e.target.value)} placeholder="e.g. Daily" />
            </div>
            <div className="rxb-f">
              <label>Progression</label>
              <select value={symProgression} onChange={(e) => setSymProgression(e.target.value)}>
                <option value="">—</option>
                <option>Improving</option>
                <option>Stable</option>
                <option>Worsening</option>
                <option>Fluctuating</option>
              </select>
            </div>
            <div className="rxb-f">
              <label>Associated Symptoms</label>
              <input value={symAssociated} onChange={(e) => setSymAssociated(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Aggravating Factors</label>
              <input value={symAggravating} onChange={(e) => setSymAggravating(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Relieving Factors</label>
              <input value={symRelieving} onChange={(e) => setSymRelieving(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rxb-card">
          <div className="rxb-h">
            <RxCardIcon icon={Video} />
            <h4>Virtual Assessment</h4>
            <span className="rxb-auto">Home-monitored / observed</span>
          </div>
          <div className="rxb-fg g3">
            <div className="rxb-f">
              <label>General Appearance</label>
              <input value={examAppearance} onChange={(e) => setExamAppearance(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Alertness</label>
              <input value={examAlertness} onChange={(e) => setExamAlertness(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Respiratory Distress</label>
              <input value={examRespiratory} onChange={(e) => setExamRespiratory(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Temp (home)</label>
              <input value={examTemp} onChange={(e) => setExamTemp(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>BP (home)</label>
              <input value={examBp} onChange={(e) => setExamBp(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>SpO₂ (oximeter)</label>
              <input value={examSpo2} onChange={(e) => setExamSpo2(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Heart Rate (home)</label>
              <input value={examHr} onChange={(e) => setExamHr(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Blood Sugar (home)</label>
              <input value={examSugar} onChange={(e) => setExamSugar(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Visible Swelling</label>
              <input value={examSwelling} onChange={(e) => setExamSwelling(e.target.value)} />
            </div>
          </div>
          <div className="rxb-fg g1" style={{ marginTop: 11 }}>
            <div className="rxb-f">
              <label>Physician Observations</label>
              <textarea value={examObservations} onChange={(e) => setExamObservations(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rxb-card">
          <div className="rxb-h">
            <RxCardIcon icon={Stethoscope} />
            <h4>Clinical Assessment</h4>
          </div>
          <div className="rxb-fg">
            <div className="rxb-f">
              <label>Provisional Diagnosis</label>
              <input value={provisionalDx} onChange={(e) => setProvisionalDx(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>ICD-10 Code (optional)</label>
              <input value={icd10} onChange={(e) => setIcd10(e.target.value)} placeholder="e.g. I50.9" />
            </div>
            <div className="rxb-f">
              <label>Differential Diagnosis</label>
              <input value={differentialDx} onChange={(e) => setDifferentialDx(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Risk Assessment</label>
              <input value={riskAssessment} onChange={(e) => setRiskAssessment(e.target.value)} />
            </div>
            <div className="rxb-f full">
              <label>Clinical Impression</label>
              <textarea value={clinicalImpression} onChange={(e) => setClinicalImpression(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rxb-card">
          <div className="rxb-h">
            <RxCardIcon icon={FlaskConical} />
            <h4>Investigations</h4>
          </div>
          <div className="rxb-chips">
            {INVESTIGATIONS.map((inv) => (
              <button
                key={inv}
                type="button"
                className={`rxb-chip inv${selectedInvestigations.includes(inv) ? " on" : ""}`}
                onClick={() => toggleInvestigation(inv)}
              >
                {inv}
              </button>
            ))}
          </div>
          <div className="rxb-f" style={{ marginTop: 11 }}>
            <label>Custom investigation</label>
            <input
              value={invCustomInput}
              onChange={(e) => setInvCustomInput(e.target.value)}
              placeholder="Type and press Enter to add"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomInvestigation();
                }
              }}
            />
          </div>
          {customInvestigations.length > 0 ? (
            <div className="rxb-chips" style={{ marginTop: 8 }}>
              {customInvestigations.map((inv) => (
                <button
                  key={inv}
                  type="button"
                  className="rxb-chip on inv"
                  onClick={() => setCustomInvestigations((prev) => prev.filter((i) => i !== inv))}
                >
                  {inv}
                  <DoctorIcon icon={X} size="sm" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rxb-card">
          <div className="rxb-h">
            <RxCardIcon icon={Pill} />
            <h4>℞ Medications</h4>
          </div>
          <div className="rxb-tools">
            <button type="button" className="rxb-tool" onClick={duplicatePrevious}>
              <DoctorIconInline icon={Copy} size="sm">
                Duplicate previous
              </DoctorIconInline>
            </button>
          </div>
          <datalist id="rxbDrugList">
            {COMMON_MEDS.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
          {meds.map((med, index) => (
            <div key={med.id} className="rxb-med">
              <div className="rxb-mno">{index + 1}</div>
              <button type="button" className="rxb-mdel" title="Remove" onClick={() => removeMed(med.id)}>
                <DoctorIcon icon={X} size="sm" />
              </button>
              <div className="rxb-fg">
                <div className="rxb-f full">
                  <label>Medicine</label>
                  <input
                    list="rxbDrugList"
                    value={med.name}
                    onChange={(e) => updateMed(med.id, { name: e.target.value })}
                    placeholder="Search medicine…"
                  />
                </div>
              </div>
              <div className="rxb-med-grid">
                <div className="rxb-f">
                  <label>Strength</label>
                  <input value={med.strength} onChange={(e) => updateMed(med.id, { strength: e.target.value })} placeholder="e.g. 5 mg" />
                </div>
                <div className="rxb-f">
                  <label>Dosage</label>
                  <input value={med.dosage} onChange={(e) => updateMed(med.id, { dosage: e.target.value })} placeholder="e.g. 1 tab" />
                </div>
                <div className="rxb-f">
                  <label>Frequency</label>
                  <input value={med.frequency} onChange={(e) => updateMed(med.id, { frequency: e.target.value })} placeholder="e.g. Twice daily" />
                </div>
                <div className="rxb-f">
                  <label>Route</label>
                  <select value={med.route} onChange={(e) => updateMed(med.id, { route: e.target.value })}>
                    {MED_ROUTES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="rxb-f">
                  <label>Duration</label>
                  <input value={med.duration} onChange={(e) => updateMed(med.id, { duration: e.target.value })} placeholder="e.g. 30 days" />
                </div>
                <div className="rxb-f">
                  <label>Food</label>
                  <select value={med.food} onChange={(e) => updateMed(med.id, { food: e.target.value })}>
                    {FOOD_OPTIONS.map((f) => (
                      <option key={f || "none"} value={f}>
                        {f || "—"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rxb-f">
                  <label>Quantity</label>
                  <input value={med.quantity} onChange={(e) => updateMed(med.id, { quantity: e.target.value })} placeholder="e.g. 30 tabs" />
                </div>
                <div className="rxb-f">
                  <label>Refill</label>
                  <input value={med.refill} onChange={(e) => updateMed(med.id, { refill: e.target.value })} placeholder="e.g. 0" />
                </div>
                <div className="rxb-f full" style={{ gridColumn: "1 / -1" }}>
                  <label>Instructions</label>
                  <input value={med.instructions} onChange={(e) => updateMed(med.id, { instructions: e.target.value })} placeholder="Special instructions…" />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="rxb-addmed" onClick={addMed}>
            ＋ Add medication
          </button>
        </div>

        <div className="rxb-card">
          <div className="rxb-h">
            <RxCardIcon icon={FileText} />
            <h4>Advice &amp; Care Plan</h4>
          </div>
          <div className="rxb-fg">
            {[
              ["Diet", adDiet, setAdDiet],
              ["Lifestyle", adLifestyle, setAdLifestyle],
              ["Exercise", adExercise, setAdExercise],
              ["Hydration", adHydration, setAdHydration],
              ["Sleep", adSleep, setAdSleep],
              ["Home Care", adHomeCare, setAdHomeCare],
              ["Isolation (if applicable)", adIsolation, setAdIsolation],
              ["Warning Signs", adWarning, setAdWarning],
            ].map(([label, value, setter]) => (
              <div key={label as string} className="rxb-f">
                <label>{label as string}</label>
                <input value={value as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)} />
              </div>
            ))}
            <div className="rxb-f full">
              <label>Emergency Instructions</label>
              <input value={adEmergency} onChange={(e) => setAdEmergency(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rxb-card">
          <div className="rxb-h">
            <RxCardIcon icon={RotateCw} />
            <h4>Follow-up Plan</h4>
          </div>
          <div className="rxb-fg g3">
            <div className="rxb-f">
              <label>Follow-up Required</label>
              <select value={fupRequired} onChange={(e) => setFupRequired(e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div className="rxb-f">
              <label>Follow-up After</label>
              <select value={fupAfter} onChange={(e) => setFupAfter(e.target.value)}>
                <option value="">—</option>
                <option>3 days</option>
                <option>1 week</option>
                <option>2 weeks</option>
                <option>1 month</option>
                <option>3 months</option>
              </select>
            </div>
            <div className="rxb-f">
              <label>Follow-up Date</label>
              <input type="date" value={fupDate} onChange={(e) => setFupDate(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Recommended Mode</label>
              <select value={fupType} onChange={(e) => setFupType(e.target.value)}>
                <option>Video</option>
                <option>Chat</option>
                <option>Phone</option>
                <option>In-person</option>
              </select>
            </div>
            <div className="rxb-f">
              <label>Referral to Specialist</label>
              <input value={fupReferral} onChange={(e) => setFupReferral(e.target.value)} />
            </div>
            <div className="rxb-f">
              <label>Referral Notes</label>
              <input value={fupReferralNotes} onChange={(e) => setFupReferralNotes(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rxb-card">
          <div className="rxb-h">
            <RxCardIcon icon={Lock} />
            <h4>Doctor Notes (Private)</h4>
          </div>
          <div className="rxb-f full">
            <textarea
              value={privateNotes}
              onChange={(e) => setPrivateNotes(e.target.value)}
              placeholder="Visible to doctors &amp; admins only…"
            />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".78rem", color: "var(--rx-muted)", marginTop: 9, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={includePrivateInPatient}
              onChange={(e) => setIncludePrivateInPatient(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "var(--rx-blue)" }}
            />
            Include these notes in the patient-facing prescription
          </label>
        </div>
      </div>

      <div className="rxb-footer">
        <span className="rxb-status">
          <span className="rxb-dot" />
          {footStatus}
        </span>
        <button type="button" className="rxb-btn out" onClick={handleSaveDraft} disabled={saveDraft.isPending}>
          <DoctorIconInline icon={Save} size="sm">
            Save Draft
          </DoctorIconInline>
        </button>
        <button type="button" className="rxb-btn out" onClick={handlePreview}>
          <DoctorIconInline icon={Eye} size="sm">
            Preview
          </DoctorIconInline>
        </button>
        <button
          type="button"
          className="rxb-btn green"
          onClick={handleFinalize}
          disabled={issuePrescription.isPending}
        >
          <DoctorIconInline icon={BadgeCheck} size="sm">
            Finalize &amp; Send to Patient
          </DoctorIconInline>
        </button>
      </div>
    </div>,
    document.body,
  );
}
