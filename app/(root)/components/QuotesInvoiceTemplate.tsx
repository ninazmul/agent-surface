import { ILead } from "@/lib/database/models/lead.model";
import { IProfile } from "@/lib/database/models/profile.model";
import { IQuotation } from "@/lib/database/models/quotation.model";
import Image from "next/image";

type QuotesInvoiceTemplateProps = {
  data: ILead | IQuotation;
  agency: IProfile;
};

interface IServices {
  title: string;
  serviceType: string;
  amount: number;
}

export default function QuotesInvoiceTemplate({
  data,
  agency,
}: QuotesInvoiceTemplateProps) {
  const services: IServices[] = (data.services || []).map((s) => ({
    title: s.title,
    serviceType: s.serviceType,
    amount: Number(s.amount) || 0,
  }));

  const courseAmount = Array.isArray(data.course)
    ? data.course.reduce((sum, s) => sum + Number(s.courseFee || 0), 0)
    : 0;
  const discount = Number(data.discount) || 0;
  const subTotal =
    courseAmount + services.reduce((sum, s) => sum + s.amount, 0);
  const grandTotal = subTotal - discount;

  const formatDate = (date: string | Date | undefined) =>
    date
      ? new Date(date).toLocaleDateString("en-IE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "N/A";

  return (
    <div className="relative w-[210mm] min-h-[297mm] p-10 bg-white text-gray-800 font-serif">
      {/* === PAID Watermark === */}
      {data?.paymentStatus === "Accepted" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <Image
            src="/assets/images/paid.png"
            alt="Paid Stamp"
            width={600}
            height={600}
            unoptimized
            className="opacity-20 rotate-[-20deg] object-contain"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-300 mb-6 pb-2">
        <div className="h-20 w-auto relative">
          <Image
            src="/assets/images/logo.png"
            alt="AB Partner Portal Logo"
            width={150}
            height={80}
            className="h-20 w-auto object-contain"
            unoptimized
          />
          <Image
            src="/assets/images/logo-white.png"
            alt="AB Partner Portal Logo"
            width={150}
            height={80}
            className="object-contain hidden dark:block"
            unoptimized
          />
        </div>

        <div className="text-right text-xs leading-5 space-y-0.5 text-gray-700">
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
      <div className="mb-8 flex justify-between w-full">
        <div>
          <h1 className="text-2xl font-extrabold uppercase mb-2 text-primary-700">
            Invoice
          </h1>
          <p className="text-gray-600 text-xs">
            <span className="font-medium">Issue Date:</span>{" "}
            {formatDate(data.createdAt)}
          </p>
        </div>

        <div className="w-1/3 bg-gray-50 border border-gray-200 rounded-md p-3 text-sm shadow-sm">
          <h2 className="text-sm font-semibold text-primary-800 border-b pb-1 mb-2">
            Student Information
          </h2>
          <div className="space-y-1 text-gray-700">
            <p>
              <span className="font-medium">Name:</span> {data.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {data.email}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {data.number}
            </p>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="mb-10 overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm text-left rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 uppercase tracking-wide">
            <tr>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Qty</th>
              <th className="py-3 px-4">Unit Price</th>
              <th className="py-3 px-4">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* === Courses === */}
            {Array.isArray(data.course) &&
              data.course.map((c, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-2 px-4 font-semibold text-gray-800">
                    {c.name}
                    <p className="text-xs text-gray-500">
                      {c.courseType} • {c.courseDuration}
                    </p>
                    <p className="text-xs text-gray-500">
                      {c.campus
                        ? `${c.campus.name || "Unknown Campus"} (${
                            c.campus.shift || "N/A"
                          })`
                        : "No campus info"}
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

            {/* === Other Services === */}
            {services.map((service, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="py-2 px-4">
                  <p className="font-medium">{service.title}</p>
                  <p className="text-xs text-gray-500">
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
          <div className="w-1/3 bg-gray-50 border border-gray-200 rounded-md p-4 text-sm shadow-sm">
            <div className="flex justify-between py-1">
              <span className="font-medium text-gray-700">Subtotal</span>
              <span className="font-semibold text-gray-800">
                €{subTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium text-gray-700">Discount</span>
              <span className="font-semibold text-red-600">
                - €{discount.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between py-1">
              <span className="font-bold text-gray-900 text-lg">Total</span>
              <span className="font-bold text-gray-900 text-lg">
                €{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Agency & Payment Info */}
      <div className="grid grid-cols-2 gap-8 text-sm mb-8 text-gray-800">
        <div>
          <h3 className="font-bold text-gray-700 mb-2 text-base">
            Agency Details
          </h3>
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
        <div>
          <h3 className="font-bold text-gray-700 mb-2 text-base">
            Payment Info
          </h3>
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
    </div>
  );
}
