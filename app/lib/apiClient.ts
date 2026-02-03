import axios, { AxiosError } from 'axios'


const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
})

api.interceptors.response.use(
  response => response,
  (error: AxiosError<any>) => {
    let message = 'Something went wrong'

    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        message = error.response.data.detail[0]?.msg || message
      } else if (typeof error.response.data.detail === 'string') {
        message = error.response.data.detail
      }
    } else if (error.response?.data?.message) {
      message = error.response.data.message
    }

    return Promise.reject({
      status: error.response?.status,
      message,
    })
  }
)
export default api
