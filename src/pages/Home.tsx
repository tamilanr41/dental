import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent } from "react";
import { Hero } from "@/components/home/Hero";
import { LiveChat } from "@/components/home/LiveChat";
import { ManagedContentSection, ManagedMediaSection } from "@/components/home/SiteContentSections";
import { TrustBar } from "@/components/home/TrustBar";
import { Gallery } from "@/components/home/Gallery";
import { SmileGallery } from "@/components/home/SmileGallery";

type HomeSection = ComponentType | LazyExoticComponent<ComponentType>;

const ServicesOverview = lazy(() => import("@/components/home/ServicesOverview").then((module) => ({ default: module.ServicesOverview })));
const DentistProfiles = lazy(() => import("@/components/home/DentistProfiles").then((module) => ({ default: module.DentistProfiles })));
const PatientJourney = lazy(() => import("@/components/home/PatientJourney").then((module) => ({ default: module.PatientJourney })));
const AiWorkspace = lazy(() => import("@/components/home/AiWorkspace").then((module) => ({ default: module.AiWorkspace })));

const PatientReviews = lazy(() => import("@/components/home/PatientReviews").then((module) => ({ default: module.PatientReviews })));
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
    <>
      <Hero />
      <DeferredSection component={TrustBar} minHeight={140} />
      <ManagedContentSection type="blog" />
      <DeferredSection component={ServicesOverview} minHeight={1200} />

      <DeferredSection component={DentistProfiles} minHeight={800} />
      <DeferredSection component={PatientJourney} minHeight={800} />
      <DeferredSection component={AiWorkspace} minHeight={850} />
      <DeferredSection component={PatientReviews} minHeight={700} />
      <Gallery />
      <SmileGallery />
      <ManagedMediaSection />
      <ManagedContentSection type="badge" />
      <DeferredSection component={InsuranceSection} minHeight={500} />
      <DeferredSection component={LocationSection} minHeight={700} />
      <DeferredSection component={CTASection} minHeight={500} />
      <LiveChat />
    </>
  );
}
