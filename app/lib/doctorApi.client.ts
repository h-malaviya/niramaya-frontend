import apiClient from "@/app/lib/apiClient";
import { DoctorsApiParams, DoctorsApiResponse } from "@/app/components/doctor/types";
import { buildQueryString } from "@/app/components/doctor/helpers";

export async function fetchDoctorsClient(
  params: DoctorsApiParams
): Promise<DoctorsApiResponse> {
  const query = buildQueryString(params);

  const res = await apiClient.get<DoctorsApiResponse>(
    `/doctors?${query}`
  );

  return res.data;
}
