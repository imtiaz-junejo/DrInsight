"use client";

import { useRouter } from "next/navigation";
import { DoctorIconInline, PhysicianDashboardLabel, Zap } from "@/components/doctor/icons/DoctorIcons";
import { DashPageHeader } from "@/components/doctor/ui/DoctorPrimitives";
import { todayFormatted } from "@/lib/doctor-utils";
import { ManualAppointmentFormCard } from "./components/ManualAppointmentFormCard";
import { ManualAppointmentModals } from "./components/ManualAppointmentModals";
import { ManualAppointmentsTable } from "./components/ManualAppointmentsTable";
import type { UseManualAppointmentsReturn } from "./hooks/useManualAppointments";

export function ManualAppointmentsContentView(vm: UseManualAppointmentsReturn) {
  const router = useRouter();

  return (
    <>
      <DashPageHeader
        subtitle={<PhysicianDashboardLabel />}
        title="Manual Appointments"
        dateStr={todayFormatted()}
        actions={
          <button
            type="button"
            className="btn-w btn-hd-icon-amber"
            onClick={() => router.push("/doctor/clinic-schedule")}
          >
            <DoctorIconInline icon={Zap} size="button" tone="amber">
              Daily Capacity
            </DoctorIconInline>
          </button>
        }
      />

      <ManualAppointmentFormCard
        mode={vm.mode}
        setMode={vm.setMode}
        search={vm.search}
        setSearch={vm.setSearch}
        doSearch={vm.doSearch}
        selPatient={vm.selPatient}
        setSelPatient={vm.setSelPatient}
        searchMsg={vm.searchMsg}
        newName={vm.newName}
        setNewName={vm.setNewName}
        newMobile={vm.newMobile}
        setNewMobile={vm.setNewMobile}
        newGender={vm.newGender}
        setNewGender={vm.setNewGender}
        newAge={vm.newAge}
        setNewAge={vm.setNewAge}
        newCnic={vm.newCnic}
        setNewCnic={vm.setNewCnic}
        newAddress={vm.newAddress}
        setNewAddress={vm.setNewAddress}
        date={vm.date}
        setDate={vm.setDate}
        time={vm.time}
        setTime={vm.setTime}
        source={vm.source}
        setSource={vm.setSource}
        reason={vm.reason}
        setReason={vm.setReason}
        notes={vm.notes}
        setNotes={vm.setNotes}
        slots={vm.slots}
        createManualPending={vm.createManual.isPending}
        doSave={vm.doSave}
      />

      <ManualAppointmentsTable
        counts={vm.counts}
        listLoading={vm.listQuery.isLoading}
        list={vm.list}
        updateStatusPending={vm.updateStatus.isPending}
        openEdit={vm.openEdit}
        doComplete={vm.doComplete}
        setModal={vm.setModal}
      />

      <ManualAppointmentModals
        modal={vm.modal}
        closeModal={vm.closeModal}
        editDate={vm.editDate}
        setEditDate={vm.setEditDate}
        editTime={vm.editTime}
        setEditTime={vm.setEditTime}
        editSlots={vm.editSlots}
        doEdit={vm.doEdit}
        reschedulePending={vm.reschedule.isPending}
        cancelWhy={vm.cancelWhy}
        setCancelWhy={vm.setCancelWhy}
        doCancel={vm.doCancel}
        updateStatusPending={vm.updateStatus.isPending}
        detailData={vm.detailQuery.data}
        detailLoading={vm.detailQuery.isLoading}
        profile={vm.profile}
      />
    </>
  );
}
