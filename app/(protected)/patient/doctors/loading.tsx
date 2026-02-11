import RedirectOverlay from "@/app/components/common/RedirectOverlay";

export default function Loading() {
  return (
    <RedirectOverlay
      title="Loading Doctors..."
      subtitle="Fetching the best healthcare professionals for you"
    />
  );
}
