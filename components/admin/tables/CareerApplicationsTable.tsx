"use client";

import { DataTable, type Column } from "@/components/admin/common/DataTable";
import type { TableMeta } from "@/components/admin/tables/types";
import type { CareerJobRole } from "@prisma/client";

type CareerApplication = {
  id: string;
  fullName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  jobRole: CareerJobRole;
  resumeFileName: string;
  createdAt: string;
};

const jobRoleLabels: Record<CareerJobRole, string> = {
  MARKETING: "Marketing",
  SALES: "Sales",
  E_COMMERCE: "E-commerce",
  OPERATIONS: "Operations",
  OTHER: "Other",
};

const columns: Column<CareerApplication>[] = [
  {
    id: "fullName",
    header: "Candidate",
    sortKey: "fullName",
    cell: (row) => <span className="font-medium">{row.fullName}</span>,
  },
  {
    id: "email",
    header: "Email",
    cell: (row) => (
      <a
        href={`mailto:${row.email}`}
        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
      >
        {row.email}
      </a>
    ),
  },
  {
    id: "phone",
    header: "Mobile number",
    cell: (row) => {
      const phone = `${row.countryCode} ${row.phoneNumber}`;
      return (
        <a
          href={`tel:${row.countryCode}${row.phoneNumber}`}
          className="whitespace-nowrap text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          {phone}
        </a>
      );
    },
  },
  {
    id: "jobRole",
    header: "Job role",
    cell: (row) => (
      <span className="whitespace-nowrap text-sm">
        {jobRoleLabels[row.jobRole]}
      </span>
    ),
  },
  {
    id: "resume",
    header: "Resume",
    cell: (row) => (
      <a
        href={`/api/admin/career-applications/${encodeURIComponent(row.id)}/resume`}
        className="text-sm font-medium text-primary hover:underline"
      >
        {row.resumeFileName}
      </a>
    ),
  },
  {
    id: "createdAt",
    header: "Received",
    sortKey: "createdAt",
    cell: (row) => (
      <time
        dateTime={row.createdAt}
        className="whitespace-nowrap text-xs text-muted-foreground"
      >
        {new Date(row.createdAt).toLocaleString()}
      </time>
    ),
  },
];

export function CareerApplicationsTable({
  rows,
  meta,
}: {
  rows: CareerApplication[];
  meta: TableMeta;
}) {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(row) => row.id}
      {...meta}
      searchValue={meta.q}
      searchPlaceholder="Search applications…"
      emptyTitle="No career applications yet"
    />
  );
}
