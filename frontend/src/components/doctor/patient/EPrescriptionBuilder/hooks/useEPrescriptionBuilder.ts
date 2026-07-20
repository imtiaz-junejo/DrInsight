import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useDoctorProfile,
  useIssuePrescription,
  usePatientDetail,
  usePatientPrescriptions,
  usePrescriptionDraft,
  useSavePrescriptionDraft,
} from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import { doctorDisplayName, formatDateTime } from "@/lib/doctor-utils";
import {
  formatDoctorPrescriptionId,
  formatPatientDisplayId,
  formatPatientPrescriptionId,
} from "@/lib/member-ids";
import type { PrescriptionMed, PrescriptionPreviewData } from "../types";
import {
  emptyMed,
  genderLabel,
  mapIssuedToPreview,
  patientAge,
  rxStamp,
  type MedRow,
} from "../utils";

export interface EPrescriptionBuilderProps {
  patientId: string;
  patientName: string;
  patientCode: string;
  onPreview: (rx: PrescriptionPreviewData) => void;
}

export function useEPrescriptionBuilder({
  patientId,
  patientName,
  patientCode,
  onPreview,
}: EPrescriptionBuilderProps) {
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

  return {
    mounted,
    saveState,
    footStatus,
    consultId,
    apptId,
    consultDateTime,
    latestConsult,
    consultType,
    setConsultType,
    followupRef,
    setFollowupRef,
    doctorName,
    doctorSpec,
    doctorQual,
    doctorReg,
    resolvedPatientDisplayId,
    pName,
    setPName,
    pAge,
    setPAge,
    pGender,
    setPGender,
    pBlood,
    setPBlood,
    pWeight,
    setPWeight,
    pBmi,
    setPBmi,
    pAllergies,
    setPAllergies,
    pCurrentMeds,
    setPCurrentMeds,
    reason,
    setReason,
    symptomDuration,
    setSymptomDuration,
    chiefComplaint,
    setChiefComplaint,
    consultNotes,
    setConsultNotes,
    prevTreatment,
    setPrevTreatment,
    reportedSymptoms,
    toggleSymptom,
    symSeverity,
    setSymSeverity,
    symFrequency,
    setSymFrequency,
    symProgression,
    setSymProgression,
    symAssociated,
    setSymAssociated,
    symAggravating,
    setSymAggravating,
    symRelieving,
    setSymRelieving,
    examAppearance,
    setExamAppearance,
    examAlertness,
    setExamAlertness,
    examRespiratory,
    setExamRespiratory,
    examTemp,
    setExamTemp,
    examBp,
    setExamBp,
    examSpo2,
    setExamSpo2,
    examHr,
    setExamHr,
    examSugar,
    setExamSugar,
    examSwelling,
    setExamSwelling,
    examObservations,
    setExamObservations,
    provisionalDx,
    setProvisionalDx,
    icd10,
    setIcd10,
    differentialDx,
    setDifferentialDx,
    riskAssessment,
    setRiskAssessment,
    clinicalImpression,
    setClinicalImpression,
    selectedInvestigations,
    toggleInvestigation,
    invCustomInput,
    setInvCustomInput,
    addCustomInvestigation,
    customInvestigations,
    setCustomInvestigations,
    meds,
    updateMed,
    removeMed,
    addMed,
    duplicatePrevious,
    adDiet,
    setAdDiet,
    adLifestyle,
    setAdLifestyle,
    adExercise,
    setAdExercise,
    adHydration,
    setAdHydration,
    adSleep,
    setAdSleep,
    adHomeCare,
    setAdHomeCare,
    adIsolation,
    setAdIsolation,
    adWarning,
    setAdWarning,
    adEmergency,
    setAdEmergency,
    fupRequired,
    setFupRequired,
    fupAfter,
    setFupAfter,
    fupDate,
    setFupDate,
    fupType,
    setFupType,
    fupReferral,
    setFupReferral,
    fupReferralNotes,
    setFupReferralNotes,
    privateNotes,
    setPrivateNotes,
    includePrivateInPatient,
    setIncludePrivateInPatient,
    handleClose,
    handleSaveDraft,
    handlePreview,
    handleFinalize,
    saveDraft,
    issuePrescription,
  };
}
