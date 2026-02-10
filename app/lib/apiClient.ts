"use client"

import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
})

let isRefreshing = false
let queue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  queue.forEach(p => {
    if (error) p.reject(error)
    else p.resolve(token)
  })
  queue = []
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config

    if (
      error.response?.status === 401 &&
      !original._retry
    ) {
      original._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then(() => api(original))
      }

      isRefreshing = true

      try {
        const res = await api.post("/refresh-token")

        const newAccess = res.data.access_token
        localStorage.setItem("access_token", newAccess)

        processQueue(null, newAccess)
        isRefreshing = false

        return api(original)
      } catch (err) {
        processQueue(err, null)
        isRefreshing = false

        localStorage.clear()
        document.cookie =
          "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

        window.location.href = "/login"
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

export default api

export function getErrorMessage(err: any): string {
  // Axios error
  const detail = err?.response?.data?.detail

  // Case 1: plain string
  if (typeof detail === "string") {
    return detail
  }

  // Case 2: Pydantic validation error (array)
  if (Array.isArray(detail)) {
    return detail
      .map((e) => e.msg)
      .join(", ")
  }

  // Case 3: fallback
  return "Something went wrong. Please try again."
}
