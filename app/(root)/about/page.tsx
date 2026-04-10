import { getSetting } from "@/lib/actions/setting.actions";
import { ISetting } from "@/lib/database/models/setting.model";
import { Mail, Phone, MapPin } from "lucide-react";
import {
  ImFacebook,
  ImInstagram,
  ImTwitter,
  ImUser,
  ImYoutube,
} from "react-icons/im";

export default async function AboutPage() {
  const settings: ISetting | null = await getSetting();

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="wrapper max-w-5xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold mb-12 text-gray-900 dark:text-white text-center">
          About Us
        </h1>

        {!settings ? (
          <p className="text-center text-gray-700 dark:text-gray-300">
            We are currently updating our About Us information. Please check
            back soon for more details about our company and mission.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {/* ================= ABOUT ================= */}
            {settings.aboutUs && (
              <div
                id="about-us"
                className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                  About Our Company
                </h2>

                <div
                  className="
                  prose prose-base max-w-none dark:prose-invert
                  prose-headings:font-semibold prose-headings:text-gray-900
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-strong:font-semibold prose-strong:text-gray-900
                  prose-em:italic prose-em:text-gray-800
                  prose-u:underline
                  prose-ul:list-disc prose-ul:pl-5
                  prose-ol:list-decimal prose-ol:pl-5
                  prose-li:marker:text-gray-500
                  prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:pl-3 prose-blockquote:text-gray-600 italic
                  prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-pink-600
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-md prose-pre:p-3
                  prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                  prose-img:rounded-md prose-img:shadow-sm prose-img:my-3
                  "
                  dangerouslySetInnerHTML={{ __html: settings.aboutUs }}
                />
              </div>
            )}

            {/* ================= CONTACT & SOCIAL ================= */}
            {(settings.email ||
              settings.phoneNumber ||
              settings.address ||
              settings.facebook ||
              settings.instagram ||
              settings.twitter ||
              settings.facebookGroup ||
              settings.youtube) && (
              <div
                id="contact-social"
                className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white">
                  Contact & Connect
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                  {/* CONTACT INFO */}
                  <div className="space-y-4">
                    {settings.email && (
                      <a
                        href={`mailto:${settings.email}`}
                        className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
                      >
                        <Mail size={18} />
                        <span>{settings.email}</span>
                      </a>
                    )}

                    {settings.phoneNumber && (
                      <a
                        href={`tel:${settings.phoneNumber}`}
                        className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
                      >
                        <Phone size={18} />
                        <span>{settings.phoneNumber}</span>
                      </a>
                    )}

                    {settings.address && (
                      <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                        <MapPin size={18} className="mt-1" />
                        <span>{settings.address}</span>
                      </div>
                    )}
                  </div>

                  {/* SOCIAL ICON LINKS */}
                  <div className="flex flex-wrap gap-4 w-fit">
                    {settings.facebook && (
                      <a
                        href={settings.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                      >
                        <ImFacebook size={20} />
                      </a>
                    )}

                    {settings.instagram && (
                      <a
                        href={settings.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-pink-100 dark:hover:bg-pink-900 transition"
                      >
                        <ImInstagram size={20} />
                      </a>
                    )}

                    {settings.twitter && (
                      <a
                        href={settings.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-sky-100 dark:hover:bg-sky-900 transition"
                      >
                        <ImTwitter size={20} />
                      </a>
                    )}

                    {settings.facebookGroup && (
                      <a
                        href={settings.facebookGroup}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
                      >
                        <ImUser size={20} />
                      </a>
                    )}

                    {settings.youtube && (
                      <a
                        href={settings.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900 transition"
                      >
                        <ImYoutube size={20} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
