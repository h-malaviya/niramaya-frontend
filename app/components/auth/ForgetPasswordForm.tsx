'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/app/lib/authApi'
import { emailRegex } from '@/app/lib/utils'

export default function ForgotPasswordForm() {

    const [formData, setFormData] = useState({
        email: '',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        const newErrors: Record<string, string> = {}

        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format'
        } else if (formData.email.length === 0) {

        }

        setErrors(newErrors)
    }, [formData.email])

    const isFormValid = useMemo(
        () => Object.keys(errors).length === 0 && formData.email !== '',
        [errors, formData.email]
    )

    // Helper to handle input changes
    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    // Helper to render errors (Consistent with your AuthForm)
    const renderError = (key: string) =>
        errors[key] && (
            <p className="mt-1 text-sm text-red-500">{errors[key]}</p>
        )

    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isFormValid) return

        try {
            await forgotPassword(formData.email)
            alert('If the email exists, a reset link has been sent.')
        } catch (err: any) {
            alert(err.message || 'Something went wrong')
        }
    }


    return (

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                    id="email"
                    type="email"
                    className="input w-full"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                />
                {/* This error updates automatically via useEffect */}
                {renderError('email')}
            </div>

            <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full btn-primary py-3 px-4 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
            ${isFormValid
                        ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
            >
                Send Reset Link
            </button>

            <div className="flex items-center justify-center mt-6">
                <Link
                    href="/login"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                    Back to Login
                </Link>
            </div>
        </form>
    )
}