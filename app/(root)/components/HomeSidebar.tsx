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
import {
  LayoutDashboard,
  // Users,
  Calendar,
  Grid,
  ListOrderedIcon,
  FilesIcon,
  MessageSquare,
  BookOpen,
  Bell,
  FileText,
  Shield,
  UserRoundIcon,
  Book,
  Megaphone,
  Wrench,
  Wallet,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FileEdit,
  Calendar1,
  Euro,
  Grid2x2Icon,
  Grid2X2PlusIcon,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const sidebarItems = [
  { key: "dashboard", title: "Dashboard", url: "/", icon: LayoutDashboard },
  {
    key: "leads",
    title: "Leads",
    url: "/leads",
    icon: Grid,
    children: [
      {
        key: "leads",
        title: "All Leads",
        url: "/leads",
        icon: Grid2x2Icon,
      },
      {
        key: "assigned",
        title: "Assigned Leads",
        url: "/leads/assigned",
        icon: Grid2X2PlusIcon,
      },
    ],
  },
  {
    key: "quotations",
    title: "Quotes",
    url: "/quotations",
    icon: FileEdit,
  },
  { key: "invoices", title: "Invoices", url: "/invoices", icon: FileText },
  {
    key: "commissions",
    title: "Finance",
    url: "/commissions",
    icon: ListOrderedIcon,
    children: [
      {
        key: "commissions",
        title: "Account Receivable",
        url: "/commissions",
        icon: Euro,
      },
      {
        key: "commissions",
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
  { key: "downloads", title: "Documents", url: "/downloads", icon: FilesIcon },
  { key: "resources", title: "Resources", url: "/resources", icon: BookOpen },
  {
    key: "events",
    title: "Events",
    url: "/events",
    icon: Calendar,
    children: [
      { key: "events", title: "Events", url: "/events", icon: Calendar1 },
      {
        key: "event",
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
    icon: Megaphone,
  },
  { key: "messages", title: "Messages", url: "/messages", icon: MessageSquare },
  {
    key: "notifications",
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  { key: "profile", title: "Profile", url: "/profile", icon: UserRoundIcon },
  { key: "courses", title: "Courses", url: "/courses", icon: Book },
  { key: "services", title: "Services", url: "/services", icon: Wrench },
  // { key: "users", title: "Users", url: "/users", icon: Users },
  { key: "admins", title: "Admins", url: "/admins", icon: Shield },
];

type HomeSidebarProps = {
  rolePermissions: string[];
  isAdmin: boolean;
  role?: string;
};

const HomeSidebar = ({ rolePermissions, isAdmin, role }: HomeSidebarProps) => {
  const currentPath = usePathname();
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

  // Auto-open menu if currentPath matches child
  useEffect(() => {
    filteredSidebarItems.forEach((item) => {
      if (item.children?.some((child) => currentPath.startsWith(child.url))) {
        setOpenMenus((prev) => ({ ...prev, [item.key]: true }));
      }
    });
  }, [currentPath, filteredSidebarItems]);

  const getMenuItemClasses = (active: boolean) => {
    if (active) {
      return `flex items-center justify-between px-[6px] py-2 rounded-2xl transition-colors group ${
        isAdmin ? "bg-purple-900 text-white" : "bg-primary-900 text-white"
      }`;
    }
    return "flex items-center justify-between px-[6px] py-2 rounded-2xl transition-colors group hover:bg-gray-100 dark:hover:bg-gray-800 text-primary-900 dark:text-gray-100";
  };

  const getChildItemClasses = (active: boolean) => {
    if (active) {
      return `flex items-center space-x-2 px-3 py-1.5 rounded-2xl text-sm transition-colors ${
        isAdmin ? "bg-purple-900 text-white" : "bg-primary-900 text-white"
      }`;
    }
    return "flex items-center space-x-2 px-3 py-1.5 rounded-2xl text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-primary-900 dark:text-gray-100";
  };

  return (
    <Sidebar
      className="text-primary-900 dark:text-gray-100 font-serif no-print rounded-2xl border-none bg-white dark:bg-gray-900"
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup className="space-y-4">
          <SidebarGroupLabel>
            <a
              href={role === "Student" ? "/profile" : "/"}
              className="px-4 py-3"
            >
              <Image
                src="/assets/images/logo.png"
                width={100}
                height={100}
                alt="Agent Surface logo"
                className="h-8 w-auto"
              />
            </a>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredSidebarItems.map((item) => {
                const isActive =
                  currentPath === item.url ||
                  currentPath.startsWith(`${item.url}/`);
                const hasChildren =
                  Array.isArray(item.children) && item.children.length > 0;

                return (
                  <SidebarMenuItem key={item.key}>
                    <div className={getMenuItemClasses(isActive)}>
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenus((prev) => ({
                              ...prev,
                              [item.key]: !prev[item.key],
                            }))
                          }
                          className="flex items-center space-x-4 flex-1 text-left"
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                        </button>
                      ) : (
                        <a
                          href={item.url}
                          className="flex items-center space-x-4 flex-1"
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
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
                          className="ml-2 text-gray-500 hover:text-black transition"
                        >
                          {openMenus[item.key] ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {hasChildren && openMenus[item.key] && (
                      <div className="ml-7 mt-1 space-y-1 border-l border-gray-200 pl-3">
                        {Array.isArray(item.children) &&
                          item.children.map((child) => {
                            const normalizePath = (path: string) =>
                              path.replace(/\/+$/, "");
                            const isChildActive =
                              normalizePath(currentPath) ===
                              normalizePath(child.url);
                            return (
                              <a
                                key={child.key}
                                href={child.url}
                                className={getChildItemClasses(isChildActive)}
                              >
                                <child.icon className="w-4 h-4" />
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
