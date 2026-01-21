import { IProfile } from "@/lib/database/models/profile.model";
import Image from "next/image";

type ContactAgreementCertificateTemplateProps = {
  data: IProfile;
};

export default function ContactAgreementCertificateTemplate({
  data,
}: ContactAgreementCertificateTemplateProps) {
  return (
    <div className="relative w-[210mm] min-h-[297mm] p-12 bg-white text-gray-900 font-serif border-[16px] border-yellow-600 shadow-2xl">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <Image
          src="/assets/images/logo.png"
          alt="Watermark Logo"
          width={500}
          height={500}
          className="object-contain"
          unoptimized
        />
      </div>

      {/* Header Logo */}
      <div className="flex justify-center mb-8 relative z-10">
        <Image
          src="/assets/images/logo.png"
          alt="Academic Bridge Logo"
          width={280}
          height={140}
          className="h-36 w-auto object-contain"
          unoptimized
        />
      </div>

      {/* Certificate Title */}
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-5xl font-bold tracking-wide text-gray-900 uppercase">
          Certificate
        </h1>
        <h2 className="text-2xl font-semibold text-yellow-600 mt-2 uppercase">
          of Representation
        </h2>
        <p className="text-sm mt-4 text-gray-700">Proudly Presented To</p>
        <h3 className="text-3xl italic font-semibold mt-2">{data.name}</h3>
      </div>

      {/* Certificate Body */}
      <div className="text-base leading-relaxed text-center px-12 mb-10 relative z-10">
        <p className="mb-6">
          This is to certify that{" "}
          <span className="font-semibold">{data.name}</span> for Academic
          Consultancy, having its registered office at{" "}
          <span className="font-semibold">
            {data.location}, {data.country}
          </span>
          , is an officially authorized representative of Academic Bridge Ltd,
          located at 33 Gardiner Place, Dublin 1, Ireland.
        </p>
        <p className="mb-6">
          The institution&apos;s policies and guidelines grant{" "}
          <span className="font-semibold">{data.name}</span> the authority to
          promote and facilitate admissions, provide counselling services, and
          act as a liaison between students and Academic Bridge.
        </p>
        <p className="mb-6">
          This certificate is issued in good faith and remains valid until 2026,
          unless revoked earlier by mutual agreement or policy changes.
        </p>
        <p className="font-medium mt-4">
          Issued on:{" "}
          {data.signatureDate &&
            new Date(data.signatureDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
        </p>

        {/* Authorized By Section */}
        <div className="mt-6 text-center">
          <p className="uppercase text-sm font-semibold tracking-wide text-gray-700">
            Authorized By:
          </p>
          <p className="text-base font-bold text-gray-900 mt-1">
            Academic Bridge
          </p>

          {/* Contact Block Image */}
          <div className="w-[300px] h-[200px] relative mx-auto mt-4">
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
      <div className="flex justify-between items-end px-12 pt-8 border-t border-gray-300 relative z-10">
        <div className="text-center">
          <Image
            src="/assets/images/gerard.png"
            alt="Gerard Stuart Signature"
            width={140}
            height={70}
            className="mx-auto mb-2"
            unoptimized
          />
          <p className="font-semibold">GERARD STUART</p>
          <p className="text-sm text-gray-600">DIRECTOR</p>
        </div>
        <div className="text-center">
          <Image
            src="/assets/images/fernando.png"
            alt="Fernando Comar Signature"
            width={140}
            height={70}
            className="mx-auto mb-2"
            unoptimized
          />
          <p className="font-semibold">FERNANDO COMAR</p>
          <p className="text-sm text-gray-600">SALES MANAGER</p>
        </div>
      </div>

      {/* Seal */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 drop-shadow-lg">
        <div className="w-[160px] h-[160px] relative my-2">
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
