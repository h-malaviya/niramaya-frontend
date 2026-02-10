// app/patient/appointments/payment/[appointmentId]/failure/page.tsx

import PaymentFailure from "@/app/components/payments/PaymentFailure";

export default async function PaymentFailurePage({
  params,
}: {
  params: { appointmentId: string };
}) {
  const param = Promise.resolve(params)
  const appointment_id = (await param).appointmentId
  return <PaymentFailure appointmentId={appointment_id} />;
}