import RedirectOverlay from "@/app/components/common/RedirectOverlay";

export default function Loading() {
  return (
    <RedirectOverlay
      title="Loading Calendar..."
      subtitle="Fetching available appointment slots"
    />
  );
}
