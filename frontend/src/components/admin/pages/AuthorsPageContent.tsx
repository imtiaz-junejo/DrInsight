"use client";



import Link from "next/link";

import { useState } from "react";

import {

  AdminButton,

  PanelTable,

  StatusChip,

  UserCell,

} from "@/components/admin/ui/AdminPrimitives";

import { adminUserProfileHref } from "@/lib/admin-routes";

import { userStatusChip } from "@/lib/admin-utils";

import { useAdminUiStore } from "@/store/admin-ui.store";

import { useUpdateUserStatus } from "@/services/admin-api-hooks";

import { useAdminAuthors } from "@/services/cms-api-hooks";



export function AuthorsPageContent() {

  const showToast = useAdminUiStore((s) => s.showToast);

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [searchInput, setSearchInput] = useState("");



  const authorsQuery = useAdminAuthors({ page, limit: 15, search: search || undefined });

  const updateStatus = useUpdateUserStatus();



  const authors = authorsQuery.data?.data ?? [];

  const meta = authorsQuery.data?.meta;



  const toggleAuthor = (id: string, currentStatus: string) => {

    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    const label = nextStatus === "ACTIVE" ? "Author enabled ✓" : "Author disabled";

    updateStatus.mutate(

      { id, status: nextStatus },

      { onSuccess: () => showToast(label), onError: () => showToast("Failed to update author status") },

    );

  };



  const rows = authors.map((author) => {

    const status = userStatusChip(author.status);

    return [

      <UserCell

        key={author.id}

        firstName={author.firstName}

        lastName={author.lastName}

        sub={author.email}

        seed={author.id}

        userId={author.id}

      />,

      author.email,

      String(author.articlesPublished),

      <StatusChip key={`${author.id}-s`} label={status.label} className={status.className} />,

      <div key={`${author.id}-a`} className="btn-row">

        <Link href={adminUserProfileHref(author.id)} className="btn">

          View Profile

        </Link>

        <AdminButton onClick={() => toggleAuthor(author.id, author.status)}>

          {author.status === "ACTIVE" ? "Disable" : "Enable"}

        </AdminButton>

      </div>,

    ];

  });



  return (

    <>

      <div className="panel" style={{ marginBottom: 16 }}>

        <div className="panel-bd" style={{ display: "flex", gap: 10 }}>

          <input

            type="search"

            placeholder="Search authors by name or email..."

            value={searchInput}

            onChange={(e) => setSearchInput(e.target.value)}

            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput.trim()); setPage(1); } }}

            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--gray-200)" }}

          />

          <AdminButton onClick={() => { setSearch(searchInput.trim()); setPage(1); }}>Search</AdminButton>

        </div>

      </div>



      <PanelTable

        title="✍️ Author Directory"

        actions={

          <Link href="/admin/doctor-profiles" className="btn">

            Manage Doctor Profiles →

          </Link>

        }

        headers={["Author", "Email", "Articles Published", "Status", "Actions"]}

        rows={rows}

        loading={authorsQuery.isLoading}

        pagerInfo={`Showing ${authors.length} of ${meta?.total ?? 0} authors`}

        page={page}

        totalPages={meta?.totalPages ?? 1}

        onPageChange={setPage}

        emptyMessage="No authors found"

      />

    </>

  );

}

