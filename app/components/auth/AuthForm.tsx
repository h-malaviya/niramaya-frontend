'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AccountTypeSelector, AccountType } from './AccountTypeSelector';
import { CategoryDropdown } from './CategoryDropdown';
import { loginUser, signupUser } from '@/app/lib/authApi';
import { setAuthCookies } from '@/app/lib/authCookies';
import { decodeJWT, emailRegex, passwordRegex } from '@/app/lib/utils';
import { getErrorMessage } from '@/app/lib/apiClient';
import RedirectOverlay from '../common/RedirectOverlay';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const isSignup = mode === 'signup';
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<AccountType>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

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
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = new Date().toISOString().split('T')[0];

  // Prevent back button from showing auth pages after login
  useEffect(() => {
    // Check if user is already logged in
    const refreshToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('refresh_token='))
      ?.split('=')[1];

    if (refreshToken) {
      // User is logged in, redirect them away
      const role = document.cookie
        .split('; ')
        .find((row) => row.startsWith('role='))
        ?.split('=')[1];

      const redirectUrl =
        role === 'doctor' ? '/doctor/appointments' : '/patient/doctors';
      
      window.location.replace(redirectUrl); // Use replace to prevent back navigation
    }

    // Add state to history to detect back button
    window.history.pushState(null, '', window.location.href);
    
    const handlePopState = () => {
      // If they try to go back, push the state again
      window.history.pushState(null, '', window.location.href);
      
      // Check if they're logged in
      const refreshToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('refresh_token='))
        ?.split('=')[1];

      if (refreshToken) {
        // Redirect to dashboard instead of going back
        const role = document.cookie
          .split('; ')
          .find((row) => row.startsWith('role='))
          ?.split('=')[1];

        const redirectUrl =
          role === 'doctor' ? '/doctor/appointments' : '/patient/doctors';
        
        window.location.replace(redirectUrl);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!passwordRegex.test(formData.password))
      newErrors.password = 'Password must be at least 6 characters';

    if (isSignup && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (isSignup) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.dob) {
        newErrors.dob = 'Date of birth is required';
      } else {
        const dobDate = new Date(formData.dob);
        const todayDate = new Date();

        if (isNaN(dobDate.getTime())) {
          newErrors.dob = 'Invalid date of birth';
        } else if (dobDate > todayDate) {
          newErrors.dob = 'Date of birth cannot be in the future';
        }
      }
    }

    if (isSignup && userType === 'doctor') {
      if (!formData.qualifications)
        newErrors.qualifications = 'Qualifications required';

      if (!formData.experience)
        newErrors.experience = 'Experience required';
      else if (Number(formData.experience) < 0)
        newErrors.experience = 'Experience must be positive';

      if (formData.categories.length === 0)
        newErrors.categories = 'Select at least one category';
    }

    setErrors(newErrors);
  }, [formData, userType, isSignup]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleBlur = (key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const renderError = (key: string) => {
    const hasError = errors[key];
    const isTouched = touched[key];

    if (hasError && isTouched) {
      return <p className="mt-1 text-sm text-red-500">{errors[key]}</p>;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach((key) => (allTouched[key] = true));
    setTouched(allTouched);

    // Check for validation errors
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);

    try {
      let res;

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
        };

        if (userType === 'doctor') {
          payload.doctor_data = {
            qualifications: [formData.qualifications],
            experience_years: Number(formData.experience),
            category_names: formData.categories,
          };
        }

        res = await signupUser(payload);
      } else {
        // Login flow
        try {
          res = await loginUser({
            email: formData.email,
            password: formData.password,
            device_id: 'web',
            force: false,
          });
        } catch (err: any) {
          // Handle device conflict (409)
          if (err?.response?.status === 409) {
            const confirmForce = window.confirm(
              "You're already logged in on another device. Do you want to logout from there and continue here?"
            );

            if (!confirmForce) {
              setIsLoading(false);
              return;
            }

            // Retry with force flag
            res = await loginUser({
              email: formData.email,
              password: formData.password,
              device_id: 'web',
              force: true,
            });
          } else {
            // Re-throw other errors
            throw err;
          }
        }
      }

      // Decode JWT to get role
      const decoded = decodeJWT(res.access_token);

      // Set cookies and localStorage
      setAuthCookies(res.access_token, res.refresh_token, decoded.role);
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('refresh_token', res.refresh_token);
      localStorage.setItem('role', decoded.role);

      // Show redirect overlay
      setIsRedirecting(true);

      // Redirect to appropriate dashboard
      const redirectUrl =
        decoded.role === 'doctor' ? '/doctor/appointments' : '/patient/doctors';
      
      // Use replace to prevent back button navigation to auth pages
      window.location.replace(redirectUrl);
    } catch (err: any) {
      console.error('Auth error:', err);

      const errorMessage = getErrorMessage(err);
      alert(errorMessage);

      setIsLoading(false);
      setIsRedirecting(false);
    }
  };

  if (isRedirecting) {
    return <RedirectOverlay title="Taking you to your dashboard" />;
  }

  return (
    <div>
      {isSignup && (
        <AccountTypeSelector value={userType} onChange={setUserType} />
      )}

      <form
        onSubmit={handleSubmit}
        className={`mt-8 ${
          isSignup ? 'grid grid-cols-1 gap-6 md:grid-cols-2' : 'space-y-5'
        }`}
      >
        {isSignup && (
          <>
            <div>
              <input
                className="input"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
              />
              {renderError('firstName')}
            </div>

            <div>
              <input
                className="input"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
              />
              {renderError('lastName')}
            </div>

            <div>
              <select
                className="input"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                onBlur={() => handleBlur('gender')}
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
                onChange={(e) => handleChange('dob', e.target.value)}
                onBlur={() => handleBlur('dob')}
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
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
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
                onChange={(e) => handleChange('qualifications', e.target.value)}
                onBlur={() => handleBlur('qualifications')}
              />
              {renderError('qualifications')}
            </div>

            <div>
              <input
                type="number"
                min="0"
                className="input"
                placeholder="Experience (Years)"
                value={formData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                onBlur={() => handleBlur('experience')}
              />
              {renderError('experience')}
            </div>

            <div className="md:col-span-2">
              <CategoryDropdown
                value={formData.categories}
                onChange={(categories) =>
                  setFormData((prev) => ({ ...prev, categories }))
                }
              />
              {errors.categories &&
                formData.categories.length === 0 &&
                touched.categories && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.categories}
                  </p>
                )}
            </div>
          </>
        )}

        <div className={isSignup ? '' : ''}>
          <input
            type={showPassword ? 'text' : 'password'}
            className="input"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
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
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
            />
            {renderError('confirmPassword')}
          </div>
        )}

        <div
          className={`flex items-center justify-between text-sm ${
            isSignup ? 'md:col-span-2' : ''
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
            <Link href="/forgot-password" className="text-blue-500">
              Forgot password?
            </Link>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`btn-primary ${isSignup ? 'md:col-span-2' : 'w-full'} ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {isSignup ? 'Signing up...' : 'Logging in...'}
            </span>
          ) : isSignup ? (
            'Sign Up'
          ) : (
            'Login'
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
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-500">
              Signup
            </Link>
          </>
        )}
      </p>
    </div>
  );
};