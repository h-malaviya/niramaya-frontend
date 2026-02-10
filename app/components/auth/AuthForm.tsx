'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AccountTypeSelector, AccountType } from './AccountTypeSelector'
import { CategoryDropdown } from './CategoryDropdown'
import { loginUser, signupUser } from '@/app/lib/authApi'
import { setAuthCookies } from '@/app/lib/authCookies'
import { decodeJWT, emailRegex, passwordRegex } from '@/app/lib/utils'
import RedirectOverlay from '../common/RedirectOverlay'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const isSignup = mode === 'signup'
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<AccountType>('patient')
  const [showPassword, setShowPassword] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    email: '',
    password: '',
    confirmPassword: '',
    qualifications: '',
    experience: '',
    categories: [] as string[],
  })

  // 1. Add 'touched' state to track which fields the user has visited
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const today = new Date().toISOString().split('T')[0]

  // 2. Real-time validation (Always runs, but errors are hidden unless touched)
  useEffect(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!passwordRegex.test(formData.password))
      newErrors.password = 'Password must be at least 6 characters'

    if (isSignup && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'

    if (isSignup) {
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.gender) newErrors.gender = 'Gender is required'
      if (!formData.dob) {
        newErrors.dob = 'Date of birth is required'
      } else {
        const dobDate = new Date(formData.dob)
        const todayDate = new Date()

        if (isNaN(dobDate.getTime())) {
          newErrors.dob = 'Invalid date of birth'
        } else if (dobDate > todayDate) {
          newErrors.dob = 'Date of birth cannot be in the future'
        }
      }
    }

    if (isSignup && userType === 'doctor') {
      if (!formData.qualifications)
        newErrors.qualifications = 'Qualifications required'

      if (!formData.experience)
        newErrors.experience = 'Experience required'

      if (formData.categories.length === 0)
        newErrors.categories = 'Select at least one category'
    }

    setErrors(newErrors)
  }, [formData, userType, isSignup])

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // 3. Mark field as touched when user leaves the input (onBlur)
  const handleBlur = (key: string) => {
    setTouched(prev => ({ ...prev, [key]: true }))
  }

  // 4. Only render error if the field has been touched
  const renderError = (key: string) => {
    const hasError = errors[key]
    const isTouched = touched[key]

    // Only show if error exists AND (field was touched OR form was submitted)
    if (hasError && isTouched) {
      return <p className="mt-1 text-sm text-red-500">{errors[key]}</p>
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 5. On submit, mark ALL fields as touched to show any missing required fields
    const allTouched: Record<string, boolean> = {}
    Object.keys(formData).forEach(key => allTouched[key] = true)
    setTouched(allTouched)

    if (Object.keys(errors).length > 0) return

    setIsLoading(true)
    let res

    try {
      if (isSignup) {
        const payload: any = {
          user_in: {
            email: formData.email,
            password: formData.password,
            first_name: formData.firstName,
            last_name: formData.lastName,
            date_of_birth: formData.dob,
            gender: formData.gender,
            role: userType,
          },
        }

        if (userType === 'doctor') {
          payload.doctor_data = {
            qualifications: [formData.qualifications],
            experience_years: Number(formData.experience),
            category_names: formData.categories,
          }
        }

        res = await signupUser(payload)
      } else {
        try {
          res = await loginUser({
            email: formData.email,
            password: formData.password,
            device_id: 'web',
            force: false,
          })
        } catch (err: any) {
          if (err.status === 409) {
            const confirmForce = window.confirm(
              "You're already logged in on another device. Logout there?"
            )

            if (!confirmForce) return

            res = await loginUser({
              email: formData.email,
              password: formData.password,
              device_id: 'web',
              force: true,
            })
          } else {
            alert(err.message || 'Login failed')
            return
          }
        }
      }

      const decoded = decodeJWT(res.access_token)

      setAuthCookies(
        res.access_token,
        res.refresh_token,
        decoded.role
      )
      localStorage.setItem("access_token", res.access_token)
      localStorage.setItem("refresh_token", res.refresh_token)
      localStorage.setItem("role", decoded.role)
      setIsRedirecting(true)
      window.location.href =
        decoded.role === 'doctor'
          ? '/doctor/appointments'
          : '/patient/doctors'
    } catch (err: any) {
      console.error(err)

      if (err?.response?.status === 422) {
        alert('Validation error. Please check inputs.')
      } else {
        alert(err?.message || 'Something went wrong')
      }
    } finally {
      if (!isRedirecting) {
        setIsLoading(false)
      }
    }
  }
  if (isRedirecting) {
    return (
      <RedirectOverlay title='Taking you to your dashboard'/>
    )
  }

  return (
    <div>
      {isSignup && (
        <AccountTypeSelector value={userType} onChange={setUserType} />
      )}

      <form
        onSubmit={handleSubmit}
        className={`mt-8 ${isSignup
          ? 'grid grid-cols-1 gap-6 md:grid-cols-2'
          : 'space-y-5'
          }`}
      >
        {isSignup && (
          <>
            <div>
              <input
                className="input"
                placeholder="First Name"
                value={formData.firstName}
                onChange={e => handleChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')} // Added onBlur
              />
              {renderError('firstName')}
            </div>

            <div>
              <input
                className="input"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={e => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')} // Added onBlur
              />
              {renderError('lastName')}
            </div>

            <div>
              <select
                className="input"
                value={formData.gender}
                onChange={e => handleChange('gender', e.target.value)}
                onBlur={() => handleBlur('gender')} // Added onBlur
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {renderError('gender')}
            </div>

            <div>
              <input
                type="date"
                className="input"
                max={today}
                value={formData.dob}
                onChange={e => handleChange('dob', e.target.value)}
                onBlur={() => handleBlur('dob')} // Added onBlur
              />
              {renderError('dob')}
            </div>
          </>
        )}

        <div className={isSignup ? 'md:col-span-2' : ''}>
          <input
            type="email"
            className="input"
            placeholder="Email"
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')} // Added onBlur
          />
          {renderError('email')}
        </div>

        {isSignup && userType === 'doctor' && (
          <>
            <div>
              <input
                className="input"
                placeholder="Qualifications"
                value={formData.qualifications}
                onChange={e => handleChange('qualifications', e.target.value)}
                onBlur={() => handleBlur('qualifications')} // Added onBlur
              />
              {renderError('qualifications')}
            </div>

            <div>
              <input
                className="input"
                placeholder="Experience (Years)"
                value={formData.experience}
                onChange={e => handleChange('experience', e.target.value)}
                onBlur={() => handleBlur('experience')} // Added onBlur
              />
              {renderError('experience')}
            </div>

            <div className="md:col-span-2">
              <CategoryDropdown
                value={formData.categories}
                onChange={(categories) =>
                  setFormData(prev => ({ ...prev, categories }))
                }
              />
              {/* CategoryDropdown usually handles its own blur or you can mark touched on interaction */}
              {errors.categories && isSignup && (formData.categories.length === 0 && touched.categories) && (
                <p className="mt-1 text-sm text-red-500">{errors.categories}</p>
              )}
            </div>
          </>
        )}

        <div>
          <input
            type={showPassword ? 'text' : 'password'}
            className="input"
            placeholder="Password"
            value={formData.password}
            onChange={e => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')} // Added onBlur
          />
          {renderError('password')}
        </div>

        {isSignup && (
          <div>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={e => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')} // Added onBlur
            />
            {renderError('confirmPassword')}
          </div>
        )}

        <div
          className={`flex items-center justify-between text-sm ${isSignup ? 'md:col-span-2' : ''
            }`}
        >
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Show Password
          </label>

          {!isSignup && (
            <Link
              href="/forgot-password"
              className="text-blue-500"
            >
              Forgot password?
            </Link>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`btn-primary ${isSignup ? 'md:col-span-2' : 'w-full'}
            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {isSignup ? 'Signing up...' : 'Logging in...'}
            </span>
          ) : (
            isSignup ? 'Sign Up' : 'Login'
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link href="/login" className="text-blue-500">
              Login
            </Link>
          </>
        ) : (
          <>
            Don’t have an account?{' '}
            <Link href="/signup" className="text-blue-500">
              Signup
            </Link>
          </>
        )}
      </p>
    </div>
  )
}