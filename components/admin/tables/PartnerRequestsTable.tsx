"use client";

import { DataTable, type Column } from "@/components/admin/common/DataTable";
import type { TableMeta } from "@/components/admin/tables/types";
import type { PartnerInterest } from "@prisma/client";

type PartnerRequest = {
  id: string;
  fullName: string;
  countryCode: string;
  phoneNumber: string;
  interest: PartnerInterest;
  createdAt: string;
};

const interestLabels: Record<PartnerInterest, string> = {
  DISTRIBUTOR: "Distributor",
  INFLUENCER_CREATOR: "Influencer / Creator",
  OTHER: "Others",
};

const columns: Column<PartnerRequest>[] = [
  {
    id: "fullName",
    header: "Full name",
    sortKey: "fullName",
    cell: (row) => <span className="font-medium">{row.fullName}</span>,
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
    id: "interest",
    header: "Interested as",
    cell: (row) => <span className="text-sm">{interestLabels[row.interest]}</span>,
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

export function PartnerRequestsTable({
  rows,
  meta,
}: {
  rows: PartnerRequest[];
  meta: TableMeta;
}) {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(row) => row.id}
      {...meta}
      searchValue={meta.q}
      searchPlaceholder="Search partner requests…"
      emptyTitle="No partner requests yet"
    />
  );
}
