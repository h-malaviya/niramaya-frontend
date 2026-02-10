// app/patient/appointments/payment/[appointmentId]/page.tsx

import PaymentPage from "@/app/components/payments/PaymentPage";

export default async function PaymentPageRoute({
  params,
}: {
  params: { appointmentId: string };
}) {
  const param = Promise.resolve(params)
  const appointment_id = (await param).appointmentId
  return <PaymentPage appointmentId={appointment_id} />;
}