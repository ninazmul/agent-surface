import { getLeadById } from "@/lib/actions/lead.actions";
import { getProfileByEmail } from "@/lib/actions/profile.actions";
import { getAllServices } from "@/lib/actions/service.actions";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import QuotationClient from "@/app/(root)/components/QuotationClient";
import { getAllCourses } from "@/lib/actions/course.actions";
import { getQuotationById } from "@/lib/actions/quotation.actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuotationPage({ params }: PageProps) {
  const { id } = await params;

  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);

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

  const course = await getAllCourses();
  const services = await getAllServices();
  const today = new Date().toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ✅ use whichever one exists
  const current = lead || quotation;
  const hasAccess = adminStatus || current?.author === email;

  const agencyEmail = current?.author || "";
  const agency = agencyEmail ? await getProfileByEmail(agencyEmail) : null;

  if (!agency) {
  return <p>Agency not found</p>;
}

  return (
    <QuotationClient
      lead={lead}
      quotation={quotation}
      agency={agency}
      course={course}
      services={services}
      today={today}
      hasAccess={!!hasAccess}
    />
  );
}
