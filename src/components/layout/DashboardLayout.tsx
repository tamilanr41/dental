"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { clinicImages } from "@/lib/images";
import { useAuth } from "@/lib/use-auth";
import { api, type AdminSummary } from "@/lib/api";
import {
  BarChart3,
  Bell,
  Bot,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DollarSign,
  ExternalLink,
  FileText,
  Home,
  Images,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Search,
  Settings,
  UserCog,
  Users,
  X,
} from "lucide-react";

const sidebarLinks = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { label: "Patients", href: "/dashboard/patients", icon: Users },
  { label: "Treatments", href: "/dashboard/treatments", icon: ClipboardList },
  { label: "Billing", href: "/dashboard/billing", icon: DollarSign },
  { label: "Inventory", href: "/dashboard/inventory", icon: Package },
  { label: "Staff", href: "/dashboard/staff", icon: UserCog },
  { label: "AI Assistant", href: "/dashboard/ai-assistant", icon: Bot },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Media library", href: "/dashboard/media", icon: Images },
  { label: "Marketing", href: "/dashboard/marketing", icon: Megaphone },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

type Notification = { id: number | string; title: string; detail: string; time: string; unread: boolean };

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = user ? `${user.firstName} ${user.lastName}` : "Clinic team";
  const initials = user ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() : "SC";

  const handleSignOut = async () => {
    await logout();
    navigate("/auth/login", { replace: true });
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    if (user?.role !== "admin") return;
    let active = true;
    api
      .get<AdminSummary>("/api/admin/summary")
      .then((data) => {
        if (!active) return;
        const items: Notification[] = data.recent
          .filter((booking) => booking.status === "pending")
          .slice(0, 3)
          .map((booking) => ({
            id: booking.id,
            title: `New booking · ${booking.ref}`,
            detail: `${booking.patientName} · ${booking.serviceLabel} · ${booking.dateLabel}, ${booking.time}`,
            time: "Awaiting confirmation",
            unread: true,
          }));
        if (data.counts.today > 0) {
          items.push({
            id: "today",
            title: `${data.counts.today} appointment${data.counts.today === 1 ? "" : "s"} today`,
            detail: "Open the schedule to check patients in.",
            time: "Today",
            unread: true,
          });
        }
        data.recentPatients.slice(0, 1).forEach((patient) => {
          items.push({
            id: `p-${patient.id}`,
            title: "New patient registered",
            detail: `${patient.name} · ${patient.phone}`,
            time: "Just now",
            unread: false,
          });
        });
        if (items.length === 0) {
          items.push({
            id: "empty",
            title: "No new bookings yet",
            detail: "Patient bookings will appear here the moment they are made.",
            time: "Live",
            unread: false,
          });
        }
        setNotifications(items);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    navigate(`/dashboard/patients?q=${encodeURIComponent(value)}`);
    setSearchOpen(false);
  };

  return (
    <div className="dashboard-shell flex h-screen overflow-hidden bg-secondary-50/60">
      {/* Sidebar */}
      <aside
        className={cn(
          "dashboard-sidebar fixed inset-y-0 left-0 z-40 flex flex-col bg-ink-950 transition-all duration-300 lg:static",
          collapsed ? "w-[76px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="absolute right-3 top-5 z-10 rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
        {/* Logo */}
        <div
          className={cn(
            "flex h-[72px] items-center border-b border-white/10",
            collapsed ? "justify-center px-3" : "justify-between px-5"
          )}
        >
          <Link to="/dashboard" className="flex min-w-0 items-center gap-2.5">
            <img
              src={clinicImages.logoMark}
              alt=""
              aria-hidden="true"
              width={66}
              height={44}
              decoding="async"
              className={cn("shrink-0 object-contain brightness-0 invert", collapsed ? "h-9 w-[54px]" : "h-11 w-[66px]")}
            />
            {!collapsed && (
              <span className="min-w-0 leading-tight">
                <span className="block whitespace-nowrap font-display text-[14px] font-semibold text-white">Sri Saraswathi</span>
                <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/50">Dental Clinic</span>
              </span>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              className="hidden rounded-lg p-1.5 text-white/35 transition-colors hover:bg-white/10 hover:text-white lg:block"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            className="mx-auto mt-3 hidden rounded-lg p-1.5 text-white/35 transition-colors hover:bg-white/10 hover:text-white lg:block"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
              Workspace
            </p>
          )}
          <ul className="space-y-0.5">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? link.label : undefined}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "dashboard-nav-link group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                      collapsed && "justify-center px-0",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/50 hover:bg-white/[0.06] hover:text-white/85"
                    )}
                  >
                    <link.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        isActive ? "text-primary-300" : "text-white/40 group-hover:text-white/70"
                      )}
                    />
                    {!collapsed && <span>{link.label}</span>}
                    {!collapsed && isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl px-2 py-2",
              collapsed && "justify-center px-0"
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-[12px] font-semibold text-primary-200">
              {initials}
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-white">{displayName}</p>
                <p className="truncate text-[11px] text-white/35">
                  {user?.role === "admin" ? "Clinic administrator" : "Care team"}
                </p>
              </div>
            )}
          </div>
          <Link
            to="/"
            className={cn(
              "mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/80",
              collapsed && "justify-center px-0"
            )}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {!collapsed && "Back to website"}
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="dashboard-topbar flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              aria-expanded={searchOpen}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary-100 md:hidden"
            >
              <Search className="h-5 w-5" />
            </button>
            <form onSubmit={submitSearch} className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search patients, appointments…"
                className="h-10 w-64 rounded-full border border-border bg-card pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10 lg:w-80"
              />
            </form>
          </div>

          <div ref={popoverRef} className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen((v) => !v);
                  setProfileOpen(false);
                }}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white ring-2 ring-background">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[min(330px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lift">
                  <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                    <p className="text-[13px] font-semibold text-foreground">Notifications</p>
                    <button
                      onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-700 hover:text-primary-800"
                    >
                      <Check className="h-3 w-3" /> Mark all read
                    </button>
                  </div>
                  <ul className="max-h-[320px] overflow-y-auto">
                    {notifications.map((n) => (
                      <li key={n.id} className={cn("border-b border-border/50 px-4 py-3 last:border-0", n.unread && "bg-primary-50/40")}>
                        <div className="flex items-start gap-2.5">
                          <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", n.unread ? "bg-primary-600" : "bg-border")} />
                          <div className="min-w-0">
                            <p className="text-[12.5px] font-medium text-foreground">{n.title}</p>
                            <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">{n.detail}</p>
                            <p className="mt-1 text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground/60">{n.time}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/dashboard/appointments"
                    className="block px-4 py-3 text-center text-[12px] font-medium text-primary-700 hover:bg-secondary-50"
                  >
                    View today's schedule
                  </Link>
                </div>
              )}
            </div>

            <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
            <span className="hidden text-[12px] text-muted-foreground sm:block">
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            </span>

            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotificationsOpen(false);
                }}
                aria-label="Account menu"
                aria-expanded={profileOpen}
                className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-secondary-100"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-[12px] font-semibold text-primary-800">
                  {initials}
                </span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lift">
                  <div className="border-b border-border/70 px-4 py-3">
                    <p className="truncate text-[13px] font-semibold text-foreground">{displayName}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
                  </div>
                  <Link to="/dashboard/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] text-foreground/80 hover:bg-secondary-50">
                    <Settings className="h-4 w-4 text-muted-foreground" /> Account settings
                  </Link>
                  <Link to="/" className="flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] text-foreground/80 hover:bg-secondary-50">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" /> View website
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 border-t border-border/70 px-4 py-2.5 text-left text-[12.5px] text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {searchOpen && (
          <div className="border-b border-border/70 bg-background px-4 py-3 md:hidden">
            <form onSubmit={submitSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search patients by name or ID…"
                className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
              />
            </form>
          </div>
        )}

        {/* Page content */}
        <main className="dashboard-main flex-1 overflow-y-auto">
          <div className="dashboard-content mx-auto w-full max-w-[1400px] p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}


