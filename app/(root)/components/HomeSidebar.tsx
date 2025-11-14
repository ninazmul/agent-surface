"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { IAdmin } from "@/lib/database/models/admin.model";
import { IProfile } from "@/lib/database/models/profile.model";
import { UserButton } from "@clerk/nextjs";
import {
  Bell,
  FileText,
  Shield,
  UserRoundIcon,
  Megaphone,
  Wallet,
  CalendarDays,
  ChevronDown,
  Calendar1,
  Euro,
  Home,
  UserRoundCogIcon,
  UserRoundPlus,
  UsersRoundIcon,
  MessageSquareQuote,
  CircleDollarSign,
  FileIcon,
  Database,
  ChevronUp,
  BadgePercent,
  MessageCircle,
  LibraryBig,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const sidebarItems = [
  { key: "dashboard", title: "Dashboard", url: "/", icon: Home },
  {
    key: "leads",
    title: "Leads",
    url: "/leads",
    icon: UserRoundCogIcon,
    children: [
      { key: "leads", title: "All Leads", url: "/leads", icon: UsersRoundIcon },
      {
        key: "assigned",
        title: "Assigned Leads",
        url: "/leads/assigned",
        icon: UserRoundPlus,
      },
    ],
  },
  {
    key: "quotations",
    title: "Quotes",
    url: "/quotations",
    icon: MessageSquareQuote,
  },
  { key: "invoices", title: "Invoices", url: "/invoices", icon: FileText },
  {
    key: "commissions",
    title: "Finance",
    url: "/commissions",
    icon: CircleDollarSign,
    children: [
      {
        key: "commissions",
        title: "Account Receivable",
        url: "/commissions",
        icon: Euro,
      },
      {
        key: "commissions-received",
        title: "Account Received",
        url: "/commissions/received",
        icon: Euro,
      },
      {
        key: "payment",
        title: "Commission",
        url: "/commissions/payment",
        icon: Wallet,
      },
    ],
  },
  { key: "downloads", title: "Documents", url: "/downloads", icon: FileIcon },
  { key: "resources", title: "Resources", url: "/resources", icon: Database },
  {
    key: "events",
    title: "Events",
    url: "/events",
    icon: CalendarDays,
    children: [
      {
        key: "events-all",
        title: "All Events",
        url: "/events",
        icon: Calendar1,
      },
      {
        key: "our-event",
        title: "Our Event",
        url: "/events/event",
        icon: CalendarDays,
      },
    ],
  },
  {
    key: "promotions",
    title: "Promotions",
    url: "/promotions",
    icon: BadgePercent,
  },
  { key: "messages", title: "Messages", url: "/messages", icon: MessageCircle },
  {
    key: "notifications",
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  { key: "profile", title: "Profile", url: "/profile", icon: UserRoundIcon },
  { key: "courses", title: "Courses", url: "/courses", icon: LibraryBig },
  { key: "services", title: "Services", url: "/services", icon: Megaphone },
  { key: "admins", title: "Admins", url: "/admins", icon: Shield },
];

type HomeSidebarProps = {
  rolePermissions: string[];
  isAdmin: boolean;
  role?: string;
  profile?: IProfile;
  admin?: IAdmin;
};

const HomeSidebar = ({
  rolePermissions,
  isAdmin,
  role,
  profile,
  admin,
}: HomeSidebarProps) => {
  const currentPath = usePathname();
  const { theme } = useTheme();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const allowedForNonAdmins = [
    "dashboard",
    "quotations",
    "events",
    "leads",
    "resources",
    "promotions",
    "commissions",
    "invoices",
    "downloads",
    "messages",
    "notifications",
    "profile",
  ];

  const filteredSidebarItems = sidebarItems.filter((item) => {
    if (isAdmin) {
      return rolePermissions?.length
        ? rolePermissions.includes(item.key) || item.key === "profile"
        : allowedForNonAdmins.includes(item.key);
    }
    if (role === "Student") {
      return ["profile", "messages", "resources", "downloads"].includes(
        item.key
      );
    }
    return allowedForNonAdmins.includes(item.key);
  });

  useEffect(() => {
    filteredSidebarItems.forEach((item) => {
      if (item.children?.some((child) => currentPath.startsWith(child.url))) {
        setOpenMenus((prev) => ({ ...prev, [item.key]: true }));
      }
    });
  }, [currentPath, filteredSidebarItems]);

  const menuItemClasses = (active: boolean) =>
    `flex items-center justify-between px-10 py-2 rounded-lg transition-colors px-10 ${
      active
        ? isAdmin
          ? "text-purple-500"
          : "text-primary-500"
        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-200"
    }`;

  const childItemClasses = (active: boolean) =>
    `flex items-center space-x-2  py-1.5 rounded-lg text-sm transition-colors ${
      active
        ? "bg-indigo-500 text-white"
        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
    }`;

  return (
    <Sidebar className="font-[var(--font-space-grotesk)] bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
      <SidebarContent>
        <SidebarGroup className="flex items-center justify-center space-y-6">
          <SidebarGroupLabel className="flex items-center justify-items-center">
            <a href={role === "Student" ? "/profile" : "/"}>
              <Image
                src={
                  theme === "dark"
                    ? "/assets/images/logo-white.png"
                    : "/assets/images/logo.png"
                }
                width={100}
                height={100}
                alt="Logo"
                className="w-full h-auto"
              />
            </a>
          </SidebarGroupLabel>
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 dark:text-gray-800 rounded-xl w-5/6">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10",
                  userButtonBox: "h-auto px-0 py-0",
                },
              }}
            />
            <div>
              <h1 className="text-sm font-semibold">
                {profile?.name || admin?.name || "User Name"}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-100">
                {profile?.role || (admin ? "Admin" : "User")}&apos;s Profile
              </p>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredSidebarItems.map((item) => {
                const isActive =
                  currentPath === item.url ||
                  currentPath.startsWith(`${item.url}/`);
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <SidebarMenuItem key={item.key}>
                    <div className={menuItemClasses(isActive)}>
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenus((prev) => ({
                              ...prev,
                              [item.key]: !prev[item.key],
                            }))
                          }
                          className="flex items-center space-x-3 flex-1 text-left"
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </button>
                      ) : (
                        <a
                          href={item.url}
                          className="flex items-center space-x-3 flex-1"
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </a>
                      )}

                      {hasChildren && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenMenus((prev) => ({
                              ...prev,
                              [item.key]: !prev[item.key],
                            }));
                          }}
                          className="ml-2 text-gray-500 hover:text-gray-900 transition"
                        >
                          {openMenus[item.key] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {hasChildren && openMenus[item.key] && (
                      <div className="ml-14 mt-2 space-y-1 border-l-2 border-gray-400 pl-2">
                        {item.children.map((child) => {
                          const normalizePath = (path: string) =>
                            path.replace(/\/+$/, "");
                          const isChildActive =
                            normalizePath(currentPath) ===
                            normalizePath(child.url);
                          return (
                            <a
                              key={child.key}
                              href={child.url}
                              className={childItemClasses(isChildActive)}
                            >
                              <ChevronRight className="w-4 h-4" />
                              <span>{child.title}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default HomeSidebar;
