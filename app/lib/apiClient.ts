import axios, { AxiosError } from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  response => response,
  (error: AxiosError<any>) => {
    let message = "Something went wrong"

    if (error.response?.data?.detail) {
      message = error.response.data.detail
    }

    return Promise.reject({
      status: error.response?.status,
      message,
    })
  }
)

export default api
