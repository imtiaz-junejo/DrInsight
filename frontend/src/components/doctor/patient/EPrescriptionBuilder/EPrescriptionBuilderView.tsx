import { createPortal } from "react-dom";
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
import { COMMON_MEDS, FOOD_OPTIONS, INVESTIGATIONS, MED_ROUTES, SYMPTOMS } from "./constants";
import { RxCardIcon } from "./components/RxCardIcon";
import type { useEPrescriptionBuilder } from "./hooks/useEPrescriptionBuilder";

type EPrescriptionBuilderViewProps = ReturnType<typeof useEPrescriptionBuilder>;

export function EPrescriptionBuilderView({
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
}: EPrescriptionBuilderViewProps) {
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
