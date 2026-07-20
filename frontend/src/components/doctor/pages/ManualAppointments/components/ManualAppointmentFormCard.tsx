import {
  Calendar,
  ClipboardPlus,
  DoctorIconInline,
  Plus,
  Save,
  Search,
  X,
} from "@/components/doctor/icons/DoctorIcons";
import { DashCard, PersonAvatar } from "@/components/doctor/ui/DoctorPrimitives";
import { getInitials } from "@/lib/data-mappers";
import type { DoctorPatient } from "@/services/doctor-api-hooks";
import { BOOKING_SOURCES } from "../constants";
import type { ManualBookingSource } from "../types";
import { slotLabel } from "../utils";

export function ManualAppointmentFormCard({
  mode,
  setMode,
  search,
  setSearch,
  doSearch,
  selPatient,
  setSelPatient,
  searchMsg,
  newName,
  setNewName,
  newMobile,
  setNewMobile,
  newGender,
  setNewGender,
  newAge,
  setNewAge,
  newCnic,
  setNewCnic,
  newAddress,
  setNewAddress,
  date,
  setDate,
  time,
  setTime,
  source,
  setSource,
  reason,
  setReason,
  notes,
  setNotes,
  slots,
  createManualPending,
  doSave,
}: {
  mode: "existing" | "new";
  setMode: (mode: "existing" | "new") => void;
  search: string;
  setSearch: (search: string) => void;
  doSearch: () => void;
  selPatient: DoctorPatient | null;
  setSelPatient: (patient: DoctorPatient | null) => void;
  searchMsg: string | null;
  newName: string;
  setNewName: (name: string) => void;
  newMobile: string;
  setNewMobile: (mobile: string) => void;
  newGender: string;
  setNewGender: (gender: string) => void;
  newAge: string;
  setNewAge: (age: string) => void;
  newCnic: string;
  setNewCnic: (cnic: string) => void;
  newAddress: string;
  setNewAddress: (address: string) => void;
  date: string;
  setDate: (date: string) => void;
  time: string;
  setTime: (time: string) => void;
  source: ManualBookingSource;
  setSource: (source: ManualBookingSource) => void;
  reason: string;
  setReason: (reason: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  slots: string[];
  createManualPending: boolean;
  doSave: () => void;
}) {
  return (
    <DashCard
      title={
        <DoctorIconInline icon={ClipboardPlus} size="button">
          Create Manual Appointment{" "}
          <span style={{ fontWeight: 500, fontSize: ".72rem", color: "var(--gray-400)" }}>
            — walk-in · phone · clinic visit · emergency
          </span>
        </DoctorIconInline>
      }
    >
      <div className="ma-form">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            type="button"
            className={`ca-btn ${mode === "existing" ? "primary" : ""}`}
            onClick={() => {
              setMode("existing");
              setSelPatient(null);
            }}
          >
            <DoctorIconInline icon={Search} size="sm">
              Existing Patient
            </DoctorIconInline>
          </button>
          <button
            type="button"
            className={`ca-btn ${mode === "new" ? "primary" : ""}`}
            onClick={() => {
              setMode("new");
              setSelPatient(null);
            }}
          >
            <DoctorIconInline icon={Plus} size="sm">
              New Patient
            </DoctorIconInline>
          </button>
        </div>

        {mode === "existing" ? (
          <>
            <div className="ma-patient-search-row">
              <div className="form-group ma-patient-search-field">
                <label>Search by Patient ID/ Mobile Number / Name</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") doSearch();
                  }}
                  placeholder="e.g. PT-1001, +92 3xx xxxxxxx or Sarah"
                />
              </div>
              <div className="form-group ma-patient-search-btn">
                <label aria-hidden="true">&nbsp;</label>
                <button type="button" className="btn-w ma-search-submit" onClick={doSearch}>
                  <DoctorIconInline icon={Search} size="sm">
                    Search
                  </DoctorIconInline>
                </button>
              </div>
            </div>
            {selPatient ? (
              <div className="ma-patient-found">
                <PersonAvatar
                  initials={getInitials(selPatient.user.firstName, selPatient.user.lastName)}
                  seed={selPatient.patientId}
                />
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: ".9rem" }}>
                    {selPatient.user.firstName} {selPatient.user.lastName}{" "}
                    <span className="cons-chip cc-done" style={{ marginLeft: 6 }}>
                      Registered
                    </span>
                  </div>
                  <div style={{ fontSize: ".76rem", color: "var(--gray-500)" }}>
                    ID {selPatient.patientNumber ?? selPatient.patientId.slice(-6).toUpperCase()}
                    {selPatient.gender ? ` · ${selPatient.gender}` : ""}
                    {selPatient.age ? ` · ${selPatient.age} yrs` : ""}
                    {selPatient.user.phone ? ` · ${selPatient.user.phone}` : ""}
                  </div>
                </div>
                <button type="button" className="ca-btn" onClick={() => setSelPatient(null)}>
                  <DoctorIconInline icon={X} size="sm">
                    Change
                  </DoctorIconInline>
                </button>
              </div>
            ) : searchMsg ? (
              <div className="ma-patient-msg ma-patient-msg-error">{searchMsg}</div>
            ) : (
              <div className="ma-patient-msg">Search the registry to auto-fill patient details.</div>
            )}
          </>
        ) : (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Patient full name" />
              </div>
              <div className="form-group">
                <label>Mobile Number *</label>
                <input type="text" value={newMobile} onChange={(e) => setNewMobile(e.target.value)} placeholder="+92 3xx xxxxxxx" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Gender *</label>
                <select value={newGender} onChange={(e) => setNewGender(e.target.value)}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Age *</label>
                <input type="number" min={0} value={newAge} onChange={(e) => setNewAge(e.target.value)} placeholder="Years" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  CNIC / Patient ID <span style={{ color: "var(--gray-400)", fontWeight: 500 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={newCnic}
                  onChange={(e) => setNewCnic(e.target.value)}
                  placeholder="42101-xxxxxxx-x"
                />
              </div>
              <div className="form-group">
                <label>
                  Address <span style={{ color: "var(--gray-400)", fontWeight: 500 }}>(optional)</span>
                </label>
                <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="Area, City" />
              </div>
            </div>
            <div style={{ fontSize: ".74rem", color: "var(--gray-400)" }}>
              New patients are saved without a portal account — the appointment won&rsquo;t appear on a Patient
              Dashboard until they register.
            </div>
          </>
        )}

        <div
          style={{
            borderTop: "1px solid var(--gray-100)",
            margin: "18px 0 14px",
            paddingTop: 14,
            fontSize: ".8rem",
            fontWeight: 700,
            color: "var(--gray-800)",
          }}
        >
          <DoctorIconInline icon={Calendar} size="button">
            Appointment Information
          </DoctorIconInline>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Appointment Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTime("");
              }}
            />
          </div>
          <div className="form-group">
            <label>Appointment Time *</label>
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              <option value="">Select a slot...</option>
              {slots.map((s) => (
                <option key={s} value={s}>
                  {slotLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Booking Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value as ManualBookingSource)}>
              {BOOKING_SOURCES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>
              Reason for Visit <span style={{ color: "var(--gray-400)", fontWeight: 500 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. BP check, follow-up, emergency triage"
            />
          </div>
          <div className="form-group">
            <label>
              Notes <span style={{ color: "var(--gray-400)", fontWeight: 500 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes"
            />
          </div>
        </div>
        <div style={{ fontSize: ".72rem", color: "var(--gray-400)", marginBottom: 12 }}>
          Validated against working days, hours, break time, holidays, existing bookings and daily capacity — the
          same rules as website bookings. Manual appointments are auto-<b>Confirmed</b> (no approval needed).
        </div>
        <button type="button" className="btn-w" disabled={createManualPending} onClick={doSave}>
          <DoctorIconInline icon={Save} size="sm">
            Save Manual Appointment
          </DoctorIconInline>
        </button>
      </div>
    </DashCard>
  );
}
