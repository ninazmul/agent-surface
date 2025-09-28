"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { FileUploader } from "@/components/shared/FileUploader";
import {
  addSubAgentByEmailToProfile,
  createProfile,
  updateProfile,
} from "@/lib/actions/profile.actions";
import { IProfile } from "@/lib/database/models/profile.model";
import { profileDefaultValues } from "@/constants";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createNotification } from "@/lib/actions/notification.actions";
import Select from "react-select";
import countries from "world-countries";

export const profileFormSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    logo: z.string().optional(),
    email: z.string().email("Invalid email address."),
    number: z.string().min(10, "Phone number must be valid."),
    country: z.string().min(2, "Country must be at least 2 characters."),
    location: z.string().min(2, "Location must be at least 2 characters."),
    licenseDocument: z.string().optional(),
    agreementDocument: z.string().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    swiftCode: z.string().optional(),
    routingNumber: z.string().optional(),
    branchAddress: z.string().optional(),
    role: z.enum(["Agent", "Sub Agent", "Student"], {
      required_error: "Role is required",
    }),
    countryAgent: z.string().optional(),
    subAgents: z.array(z.string()).optional(),
    status: z.string().min(3, "Status must be valid."),
  })
  .refine(
    (data) => {
      if (data.role === "Sub Agent" && !data.countryAgent) {
        return false;
      }
      return true;
    },
    {
      message: "Country Agent must be selected for Sub Agents",
      path: ["countryAgent"],
    }
  );

type ProfileFormProps = {
  type: "Create" | "Update";
  profile?: IProfile;
  profileId?: string;
  agent?: IProfile[];
  isAgent?: boolean;
  email?: string;
};

const ProfileForm = ({
  type,
  profile,
  profileId,
  agent,
  isAgent,
  email,
}: ProfileFormProps) => {
  const [logo, setLogo] = useState<File[]>([]);
  const [licenseDocument, setLicenseDocument] = useState<File[]>([]);
  const [agreementDocument, setAgreementDocument] = useState<File[]>([]);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const router = useRouter();

  const countryOptions = countries.map((country) => ({
    label: `${country.flag} ${country.name.common}`,
    value: country.name.common,
  }));

  const initialValues: Partial<z.infer<typeof profileFormSchema>> =
    profile && type === "Update"
      ? {
          name: profile.name,
          logo: profile?.logo,
          email: profile.email,
          number: profile.number,
          country: profile.country,
          location: profile.location,
          licenseDocument: profile?.licenseDocument,
          agreementDocument: profile?.agreementDocument,
          bankName: profile?.bankName,
          accountNumber: profile?.accountNumber,
          swiftCode: profile?.swiftCode,
          routingNumber: profile?.routingNumber,
          branchAddress: profile?.branchAddress,
          role:
            profile.role === "Agent" || profile.role === "Sub Agent"
              ? (profile.role as "Agent" | "Sub Agent")
              : "Agent",
          countryAgent: profile?.countryAgent,
          status: profile.status,
        }
      : {
          ...profileDefaultValues,
          role: "Agent",
        };

  const { startUpload } = useUploadThing("mediaUploader");

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialValues,
  });

  const selectedRole = form.watch("role");
  const selectedCountry = form.watch("country");

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    let uploadedLogoUrl = values.logo;
    let uploadedLicenseDocumentUrl = values.licenseDocument;
    let uploadedAgreementDocumentUrl = values.agreementDocument;

    if (logo.length > 0) {
      const uploaded = await startUpload(logo);
      if (uploaded && uploaded.length > 0) {
        uploadedLogoUrl = uploaded[0].url;
      }
    }

    if (licenseDocument.length > 0) {
      const uploaded = await startUpload(licenseDocument);
      if (uploaded && uploaded.length > 0) {
        uploadedLicenseDocumentUrl = uploaded[0].url;
      }
    }

    if (agreementDocument.length > 0) {
      const uploaded = await startUpload(agreementDocument);
      if (uploaded && uploaded.length > 0) {
        uploadedAgreementDocumentUrl = uploaded[0].url;
      }
    }

    try {
      if (type === "Create") {
        const newProfile = await createProfile({
          ...values,
          logo: uploadedLogoUrl,
          licenseDocument: uploadedLicenseDocumentUrl ?? "",
          agreementDocument: uploadedAgreementDocumentUrl ?? "",
          status: "Pending",
          email: values.email,
          createdAt: profile?.createdAt || new Date(),
        });

        if (newProfile) {
          if (values.role === "Sub Agent" && values.countryAgent) {
            await addSubAgentByEmailToProfile(
              values.countryAgent,
              values.email
            );
          }

          await createNotification({
            title: `New agency profile created for ${values.name}`,
            agency: values.email,
            country: values.country,
            route: `/profile`,
          });
          form.reset();
          toast.success("Profile created! Your account is pending approval.");
          router.push(`/profile`);
        }
      } else if (type === "Update" && profileId) {
        const updatedProfile = await updateProfile(profileId, {
          ...values,
          logo: uploadedLogoUrl,
          licenseDocument: uploadedLicenseDocumentUrl,
          agreementDocument: uploadedAgreementDocumentUrl,
        });

        if (updatedProfile) {
          if (values.role === "Sub Agent" && values.countryAgent) {
            await addSubAgentByEmailToProfile(
              values.countryAgent,
              values.email
            );
          }

          await createNotification({
            title: `${values.name}'s agency profile updated!`,
            agency: values.email,
            country: values.country,
            route: `/profile`,
          });

          form.reset();
          toast.success("Profile updated successfully.");
          router.push(`/profile`);
        }
      }
    } catch (error) {
      console.error("Profile submission failed", error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 rounded-2xl bg-indigo-50 dark:bg-gray-800 p-6 shadow-sm"
      >
        {/* ===== Basic Info ===== */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Select
                      options={countryOptions}
                      isSearchable
                      value={countryOptions.find(
                        (opt) => opt.value === field.value
                      )}
                      onChange={(selected) => field.onChange(selected?.value)}
                      placeholder="Select a country"
                      classNamePrefix="react-select"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your city/location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ===== Role Selection ===== */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Agent Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {" "}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                    >
                      <option value="">Select role</option>
                      {!isAgent && <option value="Agent">Agent</option>}
                      <option value="Sub Agent">Sub Agent</option>
                      {!isAgent && <option value="Student">Student</option>}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedRole === "Sub Agent" && (
              <FormItem>
                <FormLabel>Country Agent</FormLabel>
                <FormControl>
                  {isAgent ? (
                    // Automatically set countryAgent to current user's email
                    <input
                      type="text"
                      value={email || ""}
                      readOnly
                      className="w-full p-2 border rounded dark:bg-gray-200"
                    />
                  ) : (
                    <Controller
                      control={form.control}
                      name="countryAgent"
                      render={({ field }) => {
                        const options = Array.isArray(agent)
                          ? agent
                              .filter((a) => a.country === selectedCountry)
                              .map((a) => ({
                                label: `${a.name} (${a.email})`,
                                value: a.email,
                              }))
                          : [];

                        return (
                          <Select
                            options={options}
                            isSearchable
                            value={
                              options.find(
                                (opt) => opt.value === field.value
                              ) || null
                            }
                            onChange={(selected) =>
                              field.onChange(selected?.value || "")
                            }
                            placeholder="Search and select agent"
                            classNamePrefix="react-select"
                          />
                        );
                      }}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          </div>
        </div>

        {/* ===== Bank Info ===== */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Bank Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "bankName",
              "accountNumber",
              "swiftCode",
              "routingNumber",
              "branchAddress",
            ].map((fieldName) => (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName as keyof z.infer<typeof profileFormSchema>}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {fieldName.replace(/([A-Z])/g, " $1")}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={`Enter ${fieldName}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* ===== Documents ===== */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upload Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Logo</FormLabel>
                  <FormControl className="h-72">
                    <FileUploader
                      onFieldChange={field.onChange}
                      fileUrl={field.value ?? ""}
                      setFiles={setLogo}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="licenseDocument"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Document</FormLabel>
                  <FormControl className="h-72">
                    <FileUploader
                      onFieldChange={field.onChange}
                      fileUrl={field.value ?? ""}
                      setFiles={setLicenseDocument}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="agreementDocument"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agreement Document</FormLabel>
                  <FormControl className="h-72">
                    <FileUploader
                      onFieldChange={field.onChange}
                      fileUrl={field.value ?? ""}
                      setFiles={setAgreementDocument}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="privacyPolicy"
            checked={acceptedPrivacy}
            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            className="w-4 h-4"
          />
          <a href={"/privacy-policy"} className="text-sm cursor-pointer">
            I have read and agree to the{" "}
            <span className="text-blue-600 underline">Privacy Policy</span>
          </a>
        </div>

        {/* ===== Submit Button ===== */}
        <Button
          type="submit"
          size="lg"
          disabled={!acceptedPrivacy || form.formState.isSubmitting}
          className="w-full mt-6 rounded-2xl"
        >
          {form.formState.isSubmitting
            ? "Submitting..."
            : type === "Create"
            ? "Create Profile"
            : "Update Profile"}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
