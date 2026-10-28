"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { clinicImages } from "@/lib/images";
import { useAuth } from "@/lib/use-auth";
import { useSiteContent } from "@/components/home/SiteContentSections";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { Button } from "@/components/ui/Button";
import {
  Menu,
  X,
  Phone,
  ChevronDown,
  Clock,
  LogOut,
  LayoutDashboard,
  CalendarPlus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  {
    label: "Services",
    href: "#",
    children: [
      { label: "General Dentistry", href: "/services/general-dentistry" },
      { label: "Cosmetic Dentistry", href: "/services/cosmetic-dentistry" },
      { label: "Teeth Whitening", href: "/services/teeth-whitening" },
      { label: "Dental Implants", href: "/services/dental-implants" },
      { label: "Orthodontics", href: "/services/orthodontics" },
      { label: "Root Canal", href: "/services/root-canal" },
      { label: "Pediatric Dentistry", href: "/services/pediatric-dentistry" },
      { label: "Gum Treatment", href: "/services/gum-treatment" },
      { label: "Wisdom Tooth Extraction", href: "/services/wisdom-tooth" },
      { label: "Crowns & Bridges", href: "/services/crowns-bridges" },
      { label: "Veneers", href: "/services/veneers" },
      { label: "Dentures", href: "/services/dentures" },
      { label: "Smile Makeovers", href: "/services/smile-makeovers" },
    ],
  },
  { label: "AI Platform", href: "/ai-features" },
  { label: "Our Dentists", href: "/dentists" },
  { label: "Journal", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { items: offerItems } = useSiteContent("offer");
  const hasAnnouncement = offerItems.length > 0;

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
    setDropdownOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handlePointer = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) setUserMenuOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    await logout();
    navigate("/auth/login");
  };

  const isActive = (href: string) =>
    href !== "#" && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
    <AnnouncementBanner offers={offerItems} />
    <header
      className={cn(
        "fixed inset-x-0 z-50 transition-all duration-300",
        hasAnnouncement ? "top-[30px]" : "top-0",
        scrolled || mobileOpen || pathname === "/ai-features"
          ? "border-b border-border/70 bg-background/85 shadow-[0_18px_40px_-30px_rgba(13,28,34,0.45)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav
        className={cn(
          "container-x flex items-center justify-between gap-4 transition-all duration-300",
          scrolled || mobileOpen ? "h-[68px]" : "h-[84px]"
        )}
      >
        <Link to="/" className="group flex shrink-0 items-center" aria-label="Sri Saraswathi Dental Clinic home">
          <img
            src={clinicImages.logo}
            alt="Sri Saraswathi Dental Clinic"
            width={136}
            height={70}
            fetchPriority="high"
            decoding="async"
            className="h-16 w-[136px] shrink-0 object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          {navLinks.map((link) =>
            link.children ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors",
                    dropdownOpen || pathname.startsWith("/services")
                      ? "text-foreground"
                      : "text-foreground/65 hover:text-foreground"
                  )}
                  aria-expanded={dropdownOpen}
                >
                  {link.label}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      dropdownOpen && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="absolute left-1/2 top-full z-50 w-[420px] -translate-x-1/2 pt-3"
                    >
                      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card p-2 shadow-lift">
                        <div className="grid grid-cols-2 gap-0.5">
                          {link.children.map((child) => (
                            <Link
                              key={child.label}
                              to={child.href}
                              className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] text-secondary-700 transition-colors hover:bg-primary-50 hover:text-primary-800"
                            >
                              {child.label}
                              <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                            </Link>
                          ))}
                        </div>
                        <Link
                          to="/booking"
                          className="mt-1 flex items-center justify-between rounded-xl bg-ink-950 px-4 py-3 text-[13px] font-medium text-white transition-colors hover:bg-ink-900"
                        >
                          Not sure what you need? Book a free consult
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors",
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-foreground/65 hover:text-foreground"
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-px bg-foreground/70" />
                )}
              </Link>
            )
          )}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="tel:+914244272494"
            className="mr-1 hidden items-center gap-1.5 text-[13px] font-medium text-foreground/60 transition-colors hover:text-foreground xl:flex"
          >
            <Phone className="h-3.5 w-3.5" />
            0424 427 2494
          </a>
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-border/70 bg-card/70 py-1 pl-1 pr-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary-100"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-950 text-[11px] font-semibold text-white">
                  {initials}
                </span>
                <span className="max-w-[110px] truncate">{user.firstName}</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                    userMenuOpen && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="absolute right-0 top-full z-50 w-64 pt-2"
                  >
                    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lift">
                      <div className="border-b border-border/60 px-4 py-3">
                        <p className="truncate text-[13px] font-semibold text-foreground">{displayName}</p>
                        <p className="truncate text-[11.5px] text-muted-foreground">{user.email}</p>
                        <span className="mt-1.5 inline-flex rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary-700">
                          {user.role === "admin" ? "Administrator" : "Patient"}
                        </span>
                      </div>
                      <div className="p-1.5">
                        {user.role === "admin" && (
                          <Link
                            to="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] text-secondary-700 transition-colors hover:bg-primary-50 hover:text-primary-800"
                          >
                            <LayoutDashboard className="h-3.5 w-3.5" />
                            Admin dashboard
                          </Link>
                        )}
                        {user.role === "patient" && (
                          <Link
                            to="/booking"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] text-secondary-700 transition-colors hover:bg-primary-50 hover:text-primary-800"
                          >
                            <CalendarPlus className="h-3.5 w-3.5" />
                            Book appointment
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="mt-0.5 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] text-red-700 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/auth/login" className="rounded-full px-3 py-2 text-[13px] font-medium text-foreground/65 transition-colors hover:text-foreground">
              Login
            </Link>
          )}
          <Link to="/booking">
            <Button size="sm" className="px-5">
              Book in 60s
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/60 text-foreground transition-colors hover:bg-secondary-100 lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

    </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-[45] overflow-y-auto border-t border-border/70 bg-background lg:hidden",
              hasAnnouncement ? "top-[98px]" : "top-[68px]",
            )}
          >
            <div className="container-x flex min-h-full flex-col py-5">
              {user && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-950 text-[13px] font-semibold text-white">
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-foreground">{displayName}</p>
                    <p className="truncate text-[11.5px] text-muted-foreground">
                      {user.role === "admin" ? "Administrator" : "Patient"} · {user.email}
                    </p>
                  </div>
                  {user.role === "admin" && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="shrink-0 rounded-full bg-primary-600 px-3 py-1.5 text-[11.5px] font-semibold text-white"
                    >
                      Dashboard
                    </Link>
                  )}
                </div>
              )}
              <div className="space-y-1">
                {navLinks.map((link) =>
                  link.children ? (
                    <div key={link.label} className="overflow-hidden rounded-2xl border border-border/60 bg-card/60">
                      <button
                        type="button"
                        onClick={() => setMobileServicesOpen((v) => !v)}
                        className="flex w-full items-center justify-between px-4 py-4 text-[15px] font-medium text-foreground"
                        aria-expanded={mobileServicesOpen}
                      >
                        <span className="flex items-center gap-2">
                          {link.label}
                          {pathname.startsWith("/services") && (
                            <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary-700">
                              Active
                            </span>
                          )}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                            mobileServicesOpen && "rotate-180"
                          )}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {mobileServicesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                              {link.children.map((child) => (
                                <Link
                                  key={child.label}
                                  to={child.href}
                                  className={cn(
                                    "rounded-xl px-3 py-2.5 text-[12.5px] leading-snug transition-colors active:bg-secondary-100",
                                    pathname === child.href
                                      ? "bg-primary-50 font-medium text-primary-800"
                                      : "text-secondary-700 hover:bg-secondary-100"
                                  )}
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {child.label}
                                </Link>
                              ))}
                              <Link
                                to="/booking"
                                className="col-span-2 mt-1 flex items-center justify-between rounded-xl bg-ink-950 px-4 py-3 text-[13px] font-medium text-white"
                                onClick={() => setMobileOpen(false)}
                              >
                                Not sure what you need? Book a free consult
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-medium transition-colors active:bg-secondary-100",
                        isActive(link.href)
                          ? "bg-primary-50/70 text-primary-800"
                          : "text-foreground/85"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                      <ArrowRight className={cn("h-4 w-4", isActive(link.href) ? "text-primary-600" : "text-muted-foreground")} />
                    </Link>
                  )
                )}
              </div>

              <div className="mt-6 space-y-2 border-t border-border/70 pt-6">
                <Link to="/booking" onClick={() => setMobileOpen(false)}>
                  <Button fullWidth size="lg">
                    Book in 60 Seconds
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/emergency" onClick={() => setMobileOpen(false)}>
                  <Button fullWidth variant="outline" size="lg" className="border-accent/40 text-accent-700">
                    Emergency Visit
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground">
                <a href="tel:+914244272494" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> 0424 427 2494
                </a>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Mon–Sat: 9:00 AM – 8:45 PM
                </span>
                {user ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3 font-medium text-red-700"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" /> Sign out
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ) : (
                  <Link
                    to="/auth/login"
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3 font-medium text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary-600" /> Sign in
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                )}
              </div>

              <p className="mt-auto pt-8 text-center text-[11px] text-muted-foreground/70">
                Sri Saraswathi Dental Clinic · Erode, Tamil Nadu
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

