import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent } from "react";
import { Hero } from "@/components/home/Hero";
import { LiveChat } from "@/components/home/LiveChat";
import { ManagedContentSection, ManagedMediaSection, SiteContentProvider } from "@/components/home/SiteContentSections";

type HomeSection = LazyExoticComponent<ComponentType>;

const TrustBar = lazy(() => import("@/components/home/TrustBar").then((module) => ({ default: module.TrustBar })));

const ServicesOverview = lazy(() => import("@/components/home/ServicesOverview").then((module) => ({ default: module.ServicesOverview })));
const DentistProfiles = lazy(() => import("@/components/home/DentistProfiles").then((module) => ({ default: module.DentistProfiles })));
const PatientJourney = lazy(() => import("@/components/home/PatientJourney").then((module) => ({ default: module.PatientJourney })));
const AiWorkspace = lazy(() => import("@/components/home/AiWorkspace").then((module) => ({ default: module.AiWorkspace })));

const PatientReviews = lazy(() => import("@/components/home/PatientReviews").then((module) => ({ default: module.PatientReviews })));
const Gallery = lazy(() => import("@/components/home/Gallery").then((module) => ({ default: module.Gallery })));
const InsuranceSection = lazy(() => import("@/components/home/InsuranceSection").then((module) => ({ default: module.InsuranceSection })));
const LocationSection = lazy(() => import("@/components/home/LocationSection").then((module) => ({ default: module.LocationSection })));
const CTASection = lazy(() => import("@/components/home/CTASection").then((module) => ({ default: module.CTASection })));

function DeferredSection({ component: Section, minHeight }: { component: HomeSection; minHeight: number }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "1200px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} style={{ minHeight }}>
      {shouldLoad ? (
        <Suspense fallback={<div aria-hidden="true" style={{ height: minHeight }} />}>
          <Section />
        </Suspense>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  return (
    <SiteContentProvider>
      <Hero />
      <DeferredSection component={TrustBar} minHeight={180} />
      <ManagedContentSection type="blog" />
      <DeferredSection component={ServicesOverview} minHeight={1200} />
      <ManagedContentSection type="offer" />
      <DeferredSection component={DentistProfiles} minHeight={800} />
      <DeferredSection component={PatientJourney} minHeight={800} />
      <DeferredSection component={AiWorkspace} minHeight={850} />
      <DeferredSection component={PatientReviews} minHeight={700} />
      <DeferredSection component={Gallery} minHeight={1200} />
      <ManagedMediaSection />
      <ManagedContentSection type="badge" />
      <DeferredSection component={InsuranceSection} minHeight={500} />
      <DeferredSection component={LocationSection} minHeight={700} />
      <DeferredSection component={CTASection} minHeight={500} />
      <LiveChat />
    </SiteContentProvider>
  );
}
