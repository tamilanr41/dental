import { useParams } from "react-router-dom";
import { servicesData } from "@/lib/services-data";
import { serviceImageAlts, serviceImages } from "@/lib/images";
import { ServiceTemplate } from "@/components/services/ServiceTemplate";

export default function ServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? servicesData[slug] : undefined;
  const imageUrl = slug ? serviceImages[slug] : undefined;

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900">Service Not Found</h1>
          <p className="mt-2 text-secondary-600">The service you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <ServiceTemplate
      title={data.title}
      description={data.description}
      overview={data.overview}
      benefits={data.benefits}
      procedureSteps={data.procedureSteps}
      estimatedDuration={data.estimatedDuration}
      recoveryGuidance={data.recoveryGuidance}
      faqs={data.faqs}
      priceRange={data.priceRange}
      imageUrl={imageUrl}
      imageAlt={slug ? serviceImageAlts[slug] : undefined}
    />
  );
}
