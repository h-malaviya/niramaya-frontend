'use client'
import React from 'react'

export type AccountType = 'patient' | 'doctor'

interface Props {
  value: AccountType
  onChange: (value: AccountType) => void
}

export const AccountTypeSelector = ({ value, onChange }: Props) => (
  <div className="mt-6">
    <h1 className="text-gray-500 dark:text-gray-300">Select type of account</h1>
    <div className="mt-3 flex mx-0">
      {['patient', 'doctor'].map(type => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type as AccountType)}
          className={`flex justify-center w-full px-4 py-2 rounded-md sm:w-auto sm:mx-2 focus:outline-none ${value === type
            ? 'bg-blue-500 text-white'
            : 'border border-blue-500 text-blue-500'
          }`}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}
    </div>
  </div>
)