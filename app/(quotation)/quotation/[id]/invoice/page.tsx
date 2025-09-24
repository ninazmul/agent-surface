import { getProfileByEmail } from "@/lib/actions/profile.actions";
import Image from "next/image";
import { getLeadById } from "@/lib/actions/lead.actions";
import QuotesInvoiceDownloader from "@/app/(root)/components/QuotesInvoiceDownloader";
import { getQuotationById } from "@/lib/actions/quotation.actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

interface IServices {
  title: string;
  serviceType: string;
  amount: number;
}

interface SelectedCourse {
  name: string;
  courseFee?: string | number;
  courseType?: string;
  courseDuration?: string;
  campus?: { name: string; shift: string };
  startDate?: string | Date;
  endDate?: string | Date;
}

const Invoice = async ({ params }: PageProps) => {
  const { id } = await params;

  // ✅ safely get lead without crashing
  let lead = null;
  try {
    lead = await getLeadById(id);
  } catch {
    lead = null;
  }

  // ✅ safely get quotation
  let quotation = null;
  try {
    quotation = await getQuotationById(id);
  } catch {
    quotation = null;
  }

  if (!lead && !quotation) {
    return <p>Data not found.</p>;
  }

  const data = lead || quotation;

  const agencyEmail = data?.author;
  const agency = await getProfileByEmail(agencyEmail);

  const services: IServices[] = (data.services || []).map((s: IServices) => ({
    title: s.title,
    serviceType: s.serviceType,
    amount: Number(s.amount) || 0,
  }));

  const today = new Date().toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const courseAmount = Array.isArray(data.course)
    ? (data.course as SelectedCourse[]).reduce(
        (sum: number, c: SelectedCourse) => sum + Number(c.courseFee || 0),
        0
      )
    : 0;

  const discount = Number(data.discount) || 0;
  const subTotal =
    courseAmount + services.reduce((sum, s) => sum + Number(s.amount), 0);
  const grandTotal = subTotal - discount;

  return (
    <div className="m-4 p-6 bg-white dark:bg-gray-900 text-primary-900 dark:text-gray-100 font-serif shadow-xl rounded-2xl print-container  max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <Image
          src="/assets/images/placeholder.png"
          alt="Academic Bridge Logo"
          width={120}
          height={120}
          className="object-contain"
        />
        <div className="text-right text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
          <p>33 Gardiner Place, Dublin 1 • Ireland +353 1 878 8616</p>
          <p>
            info@academicbridge.ie •{" "}
            <span className="font-semibold text-primary-700">
              www.academicbridge.ie
            </span>
          </p>
        </div>
      </div>

      {/* Invoice & Student Info */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-extrabold uppercase mb-2 text-primary-700">
            Invoice
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xs">
            <span className="font-medium">Issue Date:</span> {today}
          </p>
        </div>

        <div className=" bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-md p-3 text-sm shadow-sm">
          <h2 className="text-sm font-semibold text-primary-800 border-b pb-1 mb-2">
            Student Information
          </h2>
          <div className="space-y-1 text-gray-700 dark:text-gray-100">
            <p>
              <span className="font-medium">Name:</span> {data.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {data.email}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {data.number}
            </p>
            <p>
              <span className="font-medium">Course:</span>{" "}
              {data.course?.name || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Services Table */}
      {services.length > 0 && (
        <div className="mb-10 overflow-x-auto">
          <div className="mb-10 overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm text-left rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 uppercase tracking-wide">
                <tr>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                {Array.isArray(data.course) &&
                  data.course.length > 0 &&
                  data.course.map((c: SelectedCourse, idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-2 px-4 font-semibold text-gray-800 dark:text-gray-100">
                        Course Fee
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {c.name}
                        </p>
                      </td>
                      <td className="py-2 px-4">1</td>
                      <td className="py-2 px-4">
                        €{Number(c.courseFee || 0).toFixed(2)}
                      </td>
                      <td className="py-2 px-4">
                        €{Number(c.courseFee || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}

                {/* Other Services */}
                {services.map((service, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-2 px-4">
                      <p className="font-medium">{service.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {service.serviceType || "Additional service"}
                      </p>
                    </td>
                    <td className="py-2 px-4">1</td>
                    <td className="py-2 px-4">€{service.amount.toFixed(2)}</td>
                    <td className="py-2 px-4">€{service.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Section */}
            <div className="mt-4 w-full flex justify-end">
              <div className="w-1/3 bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-md p-4 text-sm shadow-sm">
                <div className="flex justify-between py-1">
                  <span className="font-medium text-gray-700 dark:text-gray-100">
                    Subtotal
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    €{subTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium text-gray-700 dark:text-gray-100">
                    Discount
                  </span>
                  <span className="font-semibold text-red-600">
                    - €{discount.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between py-1">
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                    Total
                  </span>
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                    €{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agency & Payment Details */}
      {agency ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-6">
          {/* Agency Details */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-500 rounded-xl p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-primary-800">
              Agency Details
            </h2>
            <p>
              <strong>Agency:</strong> {agency?.name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {agency?.email || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {agency?.number || "N/A"}
            </p>
            <p>
              <strong>Address:</strong> {agency?.location || "N/A"}
            </p>
            <p>
              <strong>Country:</strong> {agency?.country || "N/A"}
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-500 rounded-xl p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-primary-800">
              Payment Info
            </h2>
            <p>
              <strong>Bank:</strong> {agency?.bankName || "N/A"}
            </p>
            <p>
              <strong>Account No:</strong> {agency?.accountNumber || "N/A"}
            </p>
            <p>
              <strong>SWIFT:</strong> {agency?.swiftCode || "N/A"}
            </p>
            <p>
              <strong>Routing No:</strong> {agency?.routingNumber || "N/A"}
            </p>
            <p>
              <strong>Branch:</strong> {agency?.branchAddress || "N/A"}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-red-500 py-4">Agency info not available.</p>
      )}

      {/* Divider and Print */}
      <div className="border-t border-gray-300 my-6" />
      <div className="flex justify-end no-print">
        <QuotesInvoiceDownloader data={data} agency={agency} />
      </div>
    </div>
  );
};

export default Invoice;
