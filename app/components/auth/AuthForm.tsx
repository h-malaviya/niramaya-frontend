'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AccountTypeSelector, AccountType } from './AccountTypeSelector'
import { CategoryDropdown } from './CategoryDropdown'
import { loginUser, signupUser, logoutUser } from '@/app/lib/authApi'
import { setAuthCookies } from '@/app/lib/authCookies'
import { decodeJWT } from '@/app/lib/utils'
interface AuthFormProps {
  mode: 'login' | 'signup'
}
import { emailRegex,passwordRegex } from '@/app/lib/utils'
export const AuthForm = ({ mode }: AuthFormProps) => {
  const isSignup = mode === 'signup'

  const [userType, setUserType] = useState<AccountType>('patient')
  const [showPassword, setShowPassword] = useState(false)

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

  const [errors, setErrors] = useState<Record<string, string>>({})

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
      if (!formData.dob) newErrors.dob = 'Date of birth is required'
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

  const isFormValid = useMemo(
    () => Object.keys(errors).length === 0,
    [errors]
  )

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const renderError = (key: string) =>
    errors[key] && (
      <p className="mt-1 text-sm text-red-500">{errors[key]}</p>
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) return alert("Fix form errors")

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
      localStorage.setItem("access_token",res.access_token)
      localStorage.setItem("refresh_token",res.refresh_token)
      window.location.href =
        decoded.role === 'doctor'
          ? '/doctor/home'
          : '/patient/home'
    } catch (err: any) {
      console.error(err)

      if (err?.response?.status === 422) {
        alert('Validation error. Please check inputs.')
      } else {
        alert(err?.message || 'Something went wrong')
      }
    }
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
                onChange={e =>
                  handleChange('firstName', e.target.value)
                }
              />
              {renderError('firstName')}
            </div>

            <div>
              <input
                className="input"
                placeholder="Last Name"
                onChange={e =>
                  handleChange('lastName', e.target.value)
                }
              />
              {renderError('lastName')}
            </div>

            <div>
              <select
                className="input"
                onChange={e =>
                  handleChange('gender', e.target.value)
                }
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
                onChange={e =>
                  handleChange('dob', e.target.value)
                }
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
            onChange={e =>
              handleChange('email', e.target.value)
            }
          />
          {renderError('email')}
        </div>

        {isSignup && userType === 'doctor' && (
          <>
            <div>
              <input
                className="input"
                placeholder="Qualifications"
                onChange={e =>
                  handleChange('qualifications', e.target.value)
                }
              />
              {renderError('qualifications')}
            </div>

            <div>
              <input
                className="input"
                placeholder="Experience (Years)"
                onChange={e =>
                  handleChange('experience', e.target.value)
                }
              />
              {renderError('experience')}
            </div>

            <div className="md:col-span-2">
              <CategoryDropdown
                value={formData.categories}
                onChange={(categories) =>
                  setFormData(prev => ({
                    ...prev,
                    categories,
                  }))
                }
              />
              {renderError('categories')}
            </div>
          </>
        )}

        <div>
          <input
            type={showPassword ? 'text' : 'password'}
            className="input"
            placeholder="Password"
            onChange={e =>
              handleChange('password', e.target.value)
            }
          />
          {renderError('password')}
        </div>

        {isSignup && (
          <div>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="Confirm Password"
              onChange={e =>
                handleChange('confirmPassword', e.target.value)
              }
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
          className={`btn-primary ${isSignup ? 'md:col-span-2' : 'w-full'
            }`}
        >
          {isSignup ? 'Sign Up' : 'Login'}
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
