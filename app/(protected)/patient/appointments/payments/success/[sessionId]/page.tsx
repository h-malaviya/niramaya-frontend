// app/patient/appointments/payment/[appointmentId]/success/page.tsx

import PaymentSuccess from "@/app/components/payments/PaymentSuccess";

export default async function PaymentSuccessPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const param = Promise.resolve(params)
  const session_id = (await param).sessionId
  return <PaymentSuccess appointmentId={session_id} />;
}