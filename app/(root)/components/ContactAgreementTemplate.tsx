import { IProfile } from "@/lib/database/models/profile.model";
import { ISetting } from "@/lib/database/models/setting.model";
import Image from "next/image";

type ContactAgreementTemplateProps = {
  data: IProfile;
  settings: ISetting;
};

export default function ContactAgreementTemplate({
  data,
  settings,
}: ContactAgreementTemplateProps) {
  return (
    <div className="w-[210mm] bg-white text-gray-800 font-serif px-10 py-8">
      {/* TITLE */}
      <h1 className="font-bold text-xl text-center mb-6">
        Education Agency Agreement
      </h1>

      {/* INTRO */}
      <div className="space-y-4 text-sm mb-6">
        <p className="font-semibold">
          This Education Agency Agreement is made:
        </p>

        <p>
          <strong>Between – Academic Bridge Limited</strong>, a Private Training
          School, having its head office at 33 Gardiner Place, Dublin 1, Ireland
          (“AB”).
        </p>

        <p>
          <strong>And – {data?.name || "N/A"}</strong>, located at{" "}
          {data?.location || "N/A"}, {data?.country || "N/A"} (“Agent”), which
          advises, counsels, and recruits prospective international students
          from {data?.country || "N/A"}.
        </p>
      </div>

      {/* AGREEMENT BODY */}
      {settings.contractAgreement && (
        <div
          className="prose prose-sm max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: settings.contractAgreement,
          }}
        />
      )}

      {/* SIGNATURES (NO PAGE SPLIT) */}
      <div
        className="mt-10 flex justify-between gap-8 text-sm"
        style={{ pageBreakInside: "avoid" }}
      >
        {/* AB */}
        <div className="flex-1">
          <p className="font-semibold mb-2">
            Signed by AB Academic Bridge Ltd:
          </p>
          <Image
            src="/assets/images/1.png"
            alt="AB Signature"
            width={150}
            height={80}
            className="object-contain mb-2"
            unoptimized
          />
          <p className="font-semibold">Fernando Comar — Sales Manager</p>
          <p>
            Date:{" "}
            {data?.signatureDate &&
              new Date(data.signatureDate).toLocaleDateString("en-GB")}
          </p>
        </div>

        {/* AGENT */}
        <div className="flex-1">
          <p className="font-semibold mb-2">Executed as an agreement</p>

          {data?.signatureDocument ? (
            <Image
              src={data.signatureDocument}
              alt="Agent Signature"
              width={150}
              height={80}
              className="object-contain mb-2"
              unoptimized
            />
          ) : (
            <div className="h-[80px] border-2 border-dashed flex items-center justify-center text-xs text-gray-500 mb-2">
              Reserved for Agent Signature
            </div>
          )}
          <p className="font-semibold">Signed by (The Agent):</p>

          <p>
            Date:{" "}
            {data?.signatureDate &&
              new Date(data.signatureDate).toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>
    </div>
  );
}
