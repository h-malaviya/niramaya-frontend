import AppointmentCalendar from "@/app/components/calendar/AppointmentCalendar";
import { DoctorSlotsRangeResponse } from "@/app/components/calendar/Types";
import { serverFetch } from "@/app/lib/apiServer.server";

interface PageProps {
    params: {
        slug: string
    }

}
export default async function AppointmentPage(props: PageProps) {
    const params = await Promise.resolve(props.params)
    const doctorId = params.slug
    let slots: DoctorSlotsRangeResponse | null = null
   
    try {
        const slotResponse = await serverFetch(
            `doctors/${doctorId}/slots/range`
        )
        slots = slotResponse as DoctorSlotsRangeResponse

       
    } catch (err) {
        console.error("Failed to fetch slots", err)
    }
    return (
        <AppointmentCalendar data={slots} />
    )
}