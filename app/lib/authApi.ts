import api from './apiClient'

export const loginUser = async (payload: {
  email: string
  password: string
  device_id: string
  force: boolean
}) => {
  try {
    const res = await api.post('/login', payload)
    return res.data
  } catch (err: any) {
    if (err.response?.status === 409) {
      throw new Error("CONCURRENT_LOGIN")
    }
    throw err
  }
}

export const signupUser = async (payload: {
  user_in: {
    email: string
    password: string
    first_name: string
    last_name: string
    date_of_birth: string
    gender: string
    role: string
  }
  doctor_data?: {
    qualifications: string[]
    experience_years: number
    category_names: string[]
  }
}) => {
  const res = await api.post('/signup', payload)
  return res.data
}

export const logoutUser = async (refreshToken: string) => {
  console.log("logout called");
  
  return api.post(`/logout?refresh_token=${refreshToken}`)
}

export const forgotPassword = async (email: string) => {
  const res = await api.post('/forgot-password', { email })
  return res.data
}

export const resetPassword = async (payload: {
  token: string
  new_password: string
}) => {
  const res = await api.post('/reset-password', payload)
  return res.data
}

export const validateSession = async () => {
  const res = await api.get('/validate')
  return res.data
}
