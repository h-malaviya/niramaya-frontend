import "server-only";

import { serverFetch } from "./apiServer.server"
import { buildQueryString } from "@/app/components/doctor/helpers"
import { DoctorsApiParams } from "@/app/components/doctor/types"

export async function fetchDoctorsFromServer(params: DoctorsApiParams) {
  try {
    const query = buildQueryString(params)
    const data = await serverFetch(`doctors?${query}`,{
      cache: "no-store",
    })

    const doctorsArray = Array.isArray(data.doctors)
    ? data.doctors
    : Object.values(data.doctors ?? {})

  return {
    doctors: doctorsArray,
    pagination: data.pagination,
  }
  } catch (error) {
   
    return {
      doctors: [],
      pagination: {
        page: 1,
        total_pages: 0,
        total_results: 0,
        per_page: 6,
      },
    }
  }
}
