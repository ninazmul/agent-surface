import { IProfile } from "@/lib/database/models/profile.model";
import Image from "next/image";

type ContactAgreementCertificateTemplateProps = {
  data: IProfile;
};

export default function ContactAgreementCertificateTemplate({
  data,
}: ContactAgreementCertificateTemplateProps) {
  return (
    <div className="relative w-[210mm] min-h-[297mm] p-6 bg-white text-gray-900 font-serif border-[12px] border-yellow-600 shadow-lg">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <Image
          src="/assets/images/logo.png"
          alt="Watermark Logo"
          width={400}
          height={400}
          className="object-contain"
          unoptimized
        />
      </div>

      {/* Header Logo */}
      <div className="flex justify-center mb-4 relative z-10">
        <Image
          src="/assets/images/logo.png"
          alt="Academic Bridge Logo"
          width={240}
          height={120}
          className="h-28 w-auto object-contain"
          unoptimized
        />
      </div>

      {/* Certificate Title */}
      <div className="text-center mb-6 relative z-10">
        <h1 className="text-4xl font-bold tracking-wide text-gray-900 uppercase">
          Certificate
        </h1>
        <h2 className="text-xl font-semibold text-yellow-600 mt-1 uppercase">
          of Representation
        </h2>
        <p className="text-sm mt-2 text-gray-700">Proudly Presented To</p>
        <h3 className="text-xl italic font-semibold mt-1">{data.name}</h3>
      </div>

      {/* Certificate Body */}
      <div className="text-sm leading-relaxed text-center px-6 mb-6 relative z-10">
        <p className="mb-4">
          This is to certify that{" "}
          <span className="font-semibold">{data.name}</span> for Academic
          Consultancy, having its registered office at{" "}
          <span className="font-semibold">
            {data.location}, {data.country}
          </span>
          , is an officially authorized representative of Academic Bridge Ltd,
          located at 33 Gardiner Place, Dublin 1, Ireland.
        </p>
        <p className="mb-4">
          The institution&apos;s policies and guidelines grant{" "}
          <span className="font-semibold">{data.name}</span> the authority to
          promote and facilitate admissions, provide counselling services, and
          act as a liaison between students and Academic Bridge.
        </p>
        <p className="mb-4">
          This certificate is issued in good faith and remains valid until 2026,
          unless revoked earlier by mutual agreement or policy changes.
        </p>
        <p className="font-medium mt-2">
          Issued on:{" "}
          {data.signatureDate &&
            new Date(data.signatureDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
        </p>

        {/* Authorized By Section */}
        <div className="mt-4 text-center">
          <p className="uppercase text-xs font-semibold tracking-wide text-gray-700">
            Authorized By:
          </p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            Academic Bridge
          </p>

          <div className="w-[250px] h-[60px] relative mx-auto mt-2">
            <Image
              src="/assets/images/1.png"
              alt="Academic Bridge Contact Info"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="flex justify-between items-end px-6 pt-4 border-t border-gray-300 relative z-10">
        <div className="text-center">
          <Image
            src="/assets/images/gerard.png"
            alt="Gerard Stuart Signature"
            width={120}
            height={60}
            className="mx-auto mb-1"
            unoptimized
          />
          <p className="font-semibold text-sm">GERARD STUART</p>
          <p className="text-xs text-gray-600">DIRECTOR</p>
        </div>
        <div className="text-center">
          <Image
            src="/assets/images/fernando.png"
            alt="Fernando Comar Signature"
            width={120}
            height={60}
            className="mx-auto mb-1"
            unoptimized
          />
          <p className="font-semibold text-sm">FERNANDO COMAR</p>
          <p className="text-xs text-gray-600">SALES MANAGER</p>
        </div>
      </div>

      {/* Seal */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 rotate-[25deg] z-10 drop-shadow-lg">
        <div className="w-[100px] h-[100px] relative my-1">
          <Image
            src="/assets/images/seal.png"
            alt="Official Seal"
            fill
            className="object-contain"
            style={{ objectPosition: "center" }}
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
