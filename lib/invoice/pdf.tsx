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
import { createRequire } from "node:module";
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

const assetRequire = createRequire(join(process.cwd(), "package.json"));

Font.register({
  family: "YouniqlyfLatin",
  fonts: [
    {
      src: assetRequire.resolve(
        "@fontsource/noto-sans-arabic/files/noto-sans-arabic-latin-400-normal.woff",
      ),
      fontWeight: 400,
    },
    {
      src: assetRequire.resolve(
        "@fontsource/noto-sans-arabic/files/noto-sans-arabic-latin-700-normal.woff",
      ),
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: "YouniqlyfArabic",
  fonts: [
    {
      src: assetRequire.resolve(
        "@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-400-normal.woff",
      ),
      fontWeight: 400,
    },
    {
      src: assetRequire.resolve(
        "@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-700-normal.woff",
      ),
      fontWeight: 700,
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingRight: 30,
    paddingBottom: 32,
    paddingLeft: 30,
    color: "#24324b",
    fontFamily: "YouniqlyfLatin",
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
    width: "38%",
    lineHeight: 1.5,
  },
  arabicDetails: {
    fontFamily: "YouniqlyfArabic",
    textAlign: "right",
    direction: "rtl",
  },
  logo: {
    width: 74,
    height: 74,
    objectFit: "contain",
  },
  companyName: {
    marginTop: 12,
    alignItems: "center",
    color: "#bd2b3a",
  },
  companyNameEnglish: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 1.1,
    textAlign: "center",
  },
  companyNameArabic: {
    fontFamily: "YouniqlyfArabic",
    fontSize: 15,
    fontWeight: 700,
    textAlign: "center",
    direction: "rtl",
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
  invoiceTitleArabic: {
    color: "#253b78",
    fontFamily: "YouniqlyfArabic",
    fontSize: 12,
    fontWeight: 700,
    direction: "rtl",
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
  customerArabic: {
    fontFamily: "YouniqlyfArabic",
    textAlign: "right",
    direction: "rtl",
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
  headerArabic: {
    fontFamily: "YouniqlyfArabic",
    textAlign: "center",
    direction: "rtl",
    color: "#253b78",
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
  totalArabic: {
    fontFamily: "YouniqlyfArabic",
    textAlign: "right",
    direction: "rtl",
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
  footerArabic: {
    width: "45%",
    fontFamily: "YouniqlyfArabic",
    textAlign: "right",
    direction: "rtl",
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
    timeZone: "Asia/Dubai",
  }).format(value);
}

function InvoiceDocument({ data }: { data: InvoicePdfData }) {
  const logo = readFileSync(
    join(process.cwd(), "public", "logo-with-name.svg"),
  );
  const logoDataUri = `data:image/svg+xml;base64,${logo.toString("base64")}`;
  const invoiceNumber = formatInvoiceNumber(data.sequence);

  return (
    <Document
      title={`Invoice ${invoiceNumber}`}
      author="Buabed Youniqlyf Perfumes Industry FZCO"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} wrap={false}>
          <View style={styles.sellerDetails}>
            <Text>Tel: 04 881 9580 · Direct: 04 881 9583</Text>
            <Text>Fax: 04 881 9584 · P.O. Box: 61266</Text>
            <Text>Jebel Ali, Dubai, United Arab Emirates</Text>
            <Text>+971 4 881 9584 · youniqlyf@youniqlyf.ae</Text>
            <Text>TRN: 100395754300003</Text>
          </View>
          {/* React-PDF's Image component does not expose an alt prop. */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoDataUri} style={styles.logo} />
          <View style={[styles.sellerDetails, styles.arabicDetails]}>
            <Text>هاتف: 04 881 9580 · مباشر: 04 881 9583</Text>
            <Text>فاكس: 04 881 9584 · صندوق بريد: 61266</Text>
            <Text>جبل علي، دبي، الإمارات العربية المتحدة</Text>
            <Text>+971 4 881 9584 · youniqlyf@youniqlyf.ae</Text>
            <Text>الرقم الضريبي: 100395754300003</Text>
          </View>
        </View>

        <View style={styles.companyName} wrap={false}>
          <Text style={styles.companyNameArabic}>
            بو عبد بنافا لصناعة العطور
          </Text>
          <Text style={styles.companyNameEnglish}>
            BUABED YOUNIQLYF PERFUMES INDUSTRY FZCO
          </Text>
        </View>

        <View style={styles.invoiceHeading} wrap={false}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceTitleArabic}>فاتورة رقمية</Text>
            <Text>No. {invoiceNumber}</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text>Date: {formatDate(data.issuedAt)}</Text>
            <Text style={styles.arabicDetails}>
              التاريخ: {formatDate(data.issuedAt)}
            </Text>
          </View>
        </View>

        <View style={styles.customer} wrap={false}>
          <Text style={styles.customerName}>
            Customer: {data.shippingName || "Customer"}
          </Text>
          <Text style={styles.customerArabic}>
            السيد: {data.shippingName || "العميل"}
          </Text>
          {data.shippingPhone ? (
            <>
              <Text>Phone: {data.shippingPhone}</Text>
              <Text style={styles.customerArabic}>
                الهاتف: {data.shippingPhone}
              </Text>
            </>
          ) : null}
          {data.recipientEmail ? (
            <Text>Email: {data.recipientEmail}</Text>
          ) : null}
          {data.shippingAddress ? (
            <>
              <Text>Address: {data.shippingAddress}</Text>
              <Text style={styles.customerArabic}>
                العنوان: {data.shippingAddress}
              </Text>
            </>
          ) : null}
        </View>

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]} wrap={false}>
            <View style={[styles.cell, styles.serial]}>
              <Text style={styles.headerLabel}>Sr. No.</Text>
              <Text style={styles.headerArabic}>الرقم</Text>
            </View>
            <View style={[styles.cell, styles.description]}>
              <Text style={styles.headerLabel}>Description</Text>
              <Text style={styles.headerArabic}>التفاصيل</Text>
            </View>
            <View style={[styles.cell, styles.quantity]}>
              <Text style={styles.headerLabel}>Qty.</Text>
              <Text style={styles.headerArabic}>الكمية</Text>
            </View>
            <View style={[styles.cell, styles.rate]}>
              <Text style={styles.headerLabel}>Rate</Text>
              <Text style={styles.headerArabic}>السعر</Text>
            </View>
            <View style={[styles.cell, styles.amount]}>
              <Text style={styles.headerLabel}>Amount</Text>
              <Text style={styles.headerArabic}>المبلغ</Text>
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
              <Text style={styles.totalArabic}>المجموع الفرعي</Text>
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
                <Text style={styles.totalArabic}>خصم القسيمة</Text>
              </View>
              <Text>-{formatMoney(data.couponDiscount, data.currency)}</Text>
            </View>
          ) : null}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <View>
              <Text>Total</Text>
              <Text style={styles.totalArabic}>الإجمالي</Text>
            </View>
            <Text>{formatMoney(data.total, data.currency)}</Text>
          </View>
        </View>

        <View style={styles.footer} wrap={false}>
          <Text style={{ width: "50%" }}>
            This invoice was generated electronically.
          </Text>
          <Text style={styles.footerArabic}>صدرت هذه الفاتورة إلكترونياً.</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInvoicePdf(data: InvoicePdfData) {
  return renderToBuffer(<InvoiceDocument data={data} />);
}
