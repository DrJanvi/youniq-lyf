import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import "server-only";
import { formatInvoiceNumber } from "./number";

export type InvoicePdfData = {
  sequence: number;
  issuedAt: Date;
  currency: string;
  recipientEmail: string | null;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  lineSubtotal: number;
  couponCode: string | null;
  couponDiscount: number;
  total: number;
  items: { title: string; quantity: number; unitPrice: number }[];
};

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingRight: 30,
    paddingBottom: 32,
    paddingLeft: 30,
    color: "#24324b",
    fontFamily: "Helvetica",
    fontSize: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#253b78",
    paddingBottom: 10,
  },
  sellerDetails: {
    width: "72%",
    lineHeight: 1.5,
  },
  logo: {
    width: 74,
    height: 74,
    objectFit: "contain",
  },
  companyNameText: {
    marginTop: 12,
    alignItems: "center",
    color: "#bd2b3a",
  },
  companyName: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 1.1,
    textAlign: "center",
  },
  invoiceHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 16,
    marginBottom: 14,
  },
  invoiceTitle: {
    color: "#253b78",
    fontSize: 15,
    fontWeight: 700,
  },
  invoiceMeta: {
    alignItems: "flex-end",
    lineHeight: 1.6,
  },
  customer: {
    borderWidth: 1,
    borderColor: "#536aa8",
    borderRadius: 5,
    padding: 8,
    marginBottom: 12,
    lineHeight: 1.6,
  },
  customerName: {
    fontWeight: 700,
  },
  table: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#536aa8",
  },
  row: {
    flexDirection: "row",
  },
  headerRow: {
    backgroundColor: "#f0f3f9",
  },
  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#536aa8",
    paddingVertical: 6,
    paddingHorizontal: 5,
    justifyContent: "center",
  },
  serial: { width: "7%", textAlign: "center" },
  description: { width: "37%" },
  quantity: { width: "16%", textAlign: "center" },
  rate: { width: "19%", textAlign: "right" },
  amount: { width: "21%", textAlign: "right" },
  headerLabel: {
    textAlign: "center",
    color: "#253b78",
    fontWeight: 700,
    lineHeight: 1.6,
  },
  itemDescription: {
    fontWeight: 700,
    lineHeight: 1.4,
  },
  totals: {
    alignSelf: "flex-end",
    width: "43%",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#536aa8",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#536aa8",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  grandTotal: {
    color: "#253b78",
    fontWeight: 700,
    fontSize: 10,
  },
  footer: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#d7dce8",
    flexDirection: "row",
    justifyContent: "space-between",
    lineHeight: 1.5,
    color: "#59657c",
    fontSize: 7,
  },
});

export function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(value);
}

function InvoiceDocument({ data }: { data: InvoicePdfData }) {
  const logo = readFileSync(
    join(process.cwd(), "public", "logo-with-name.svg"),
  );
  const logoDataUri = `data:image/svg+xml;base64,${logo.toString("base64")}`;
  const invoiceNumber = formatInvoiceNumber(data.sequence);

  return (
    <Document title={`Invoice ${invoiceNumber}`} author="WHITE COAL CUBES">
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} wrap={false}>
          <View style={styles.sellerDetails}>
            <Text>WHITE COAL CUBES</Text>
            <Text>2, A - 19, NDSE, Part 1</Text>
            <Text>South Delhi, Delhi, 110049</Text>
            <Text>Phone: +91 9871777077</Text>
            <Text>Email: support@youniqlyf.com</Text>
            <Text>GSTIN: 07BBQPS2233B1ZR</Text>
          </View>
          {/* React-PDF's Image component does not expose an alt prop. */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoDataUri} style={styles.logo} />
        </View>

        <View style={styles.companyName} wrap={false}>
          <Text style={styles.companyNameText}>Youniqlyf</Text>
        </View>

        <View style={styles.invoiceHeading} wrap={false}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text>No. {invoiceNumber}</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text>Date: {formatDate(data.issuedAt)}</Text>
          </View>
        </View>

        <View style={styles.customer} wrap={false}>
          <Text style={styles.customerName}>
            Customer: {data.shippingName || "Customer"}
          </Text>
          {data.shippingPhone ? <Text>Phone: {data.shippingPhone}</Text> : null}
          {data.recipientEmail ? (
            <Text>Email: {data.recipientEmail}</Text>
          ) : null}
          {data.shippingAddress ? (
            <Text>Address: {data.shippingAddress}</Text>
          ) : null}
        </View>

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]} wrap={false}>
            <View style={[styles.cell, styles.serial]}>
              <Text style={styles.headerLabel}>Sr. No.</Text>
            </View>
            <View style={[styles.cell, styles.description]}>
              <Text style={styles.headerLabel}>Description</Text>
            </View>
            <View style={[styles.cell, styles.quantity]}>
              <Text style={styles.headerLabel}>Qty.</Text>
            </View>
            <View style={[styles.cell, styles.rate]}>
              <Text style={styles.headerLabel}>Rate</Text>
            </View>
            <View style={[styles.cell, styles.amount]}>
              <Text style={styles.headerLabel}>Amount</Text>
            </View>
          </View>
          {data.items.map((item, index) => (
            <View
              key={`${index}-${item.title}`}
              style={styles.row}
              wrap={false}
            >
              <View style={[styles.cell, styles.serial]}>
                <Text>{index + 1}</Text>
              </View>
              <View style={[styles.cell, styles.description]}>
                <Text style={styles.itemDescription}>{item.title}</Text>
              </View>
              <View style={[styles.cell, styles.quantity]}>
                <Text>{item.quantity}</Text>
              </View>
              <View style={[styles.cell, styles.rate]}>
                <Text>{formatMoney(item.unitPrice, data.currency)}</Text>
              </View>
              <View style={[styles.cell, styles.amount]}>
                <Text>
                  {formatMoney(item.unitPrice * item.quantity, data.currency)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totals} wrap={false}>
          <View style={styles.totalRow}>
            <View>
              <Text>Subtotal</Text>
            </View>
            <Text>{formatMoney(data.lineSubtotal, data.currency)}</Text>
          </View>
          {data.couponDiscount > 0 ? (
            <View style={styles.totalRow}>
              <View>
                <Text>
                  Coupon discount
                  {data.couponCode ? ` (${data.couponCode})` : ""}
                </Text>
              </View>
              <Text>-{formatMoney(data.couponDiscount, data.currency)}</Text>
            </View>
          ) : null}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <View>
              <Text>Total</Text>
            </View>
            <Text>{formatMoney(data.total, data.currency)}</Text>
          </View>
        </View>

        <View style={styles.footer} wrap={false}>
          <Text style={{ width: "50%" }}>
            This invoice was generated electronically.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInvoicePdf(data: InvoicePdfData) {
  return renderToBuffer(<InvoiceDocument data={data} />);
}
