'use client'

import  { useMemo, useState } from 'react'

const categories = [
  'pediatrician',
  'internist',
  'geriatrician',
  'cardiologist',
  'dermatologist',
  'endocrinologist',
  'gastroenterologist',
  'neurologist',
]

interface CategoryDropdownProps {
  value: string[]
  onChange: (categories: string[]) => void
}

export const CategoryDropdown = ({
  value,
  onChange,
}: CategoryDropdownProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredCategories = useMemo(
    () =>
      categories.filter(cat =>
        cat.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  )

  const toggleCategory = (cat: string) => {
    if (value.includes(cat)) {
      onChange(value.filter(c => c !== cat))
    } else {
      onChange([...value, cat])
    }
  }

  const removeCategory = (cat: string) => {
    onChange(value.filter(c => c !== cat))
  }

  return (
    <div className="relative">
      {/* TRIGGER */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(prev => !prev)}
        className="
          input relative flex items-center justify-between pr-10 cursor-pointer
          bg-white text-gray-900
          dark:bg-gray-900 dark:text-gray-100
        "
      >
        <span className="flex flex-wrap gap-2">
          {value.length === 0 && (
            <span className="text-gray-400 dark:text-gray-500">
              Select category
            </span>
          )}

          {value.map(cat => (
            <span
              key={cat}
              onClick={e => e.stopPropagation()}
              className="
                flex items-center gap-1 px-2 py-0.5 text-xs rounded-full
                bg-blue-100 text-blue-700
                dark:bg-blue-900 dark:text-blue-200
              "
            >
              {cat}
              <span
                onClick={() => removeCategory(cat)}
                className="ml-1 cursor-pointer hover:opacity-80"
              >
                ×
              </span>
            </span>
          ))}
        </span>

        <svg
          className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* DROPDOWN */}
      {open && (
        <div
          className="
            absolute z-20 w-full mt-2 rounded-md shadow-lg
            bg-white border border-gray-200
            dark:bg-gray-900 dark:border-gray-700
          "
        >
          {/* SEARCH */}
          <div className="p-2 border-b dark:border-gray-700">
            <input
              type="text"
              placeholder="Search category"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="
                w-full px-3 py-2 text-sm rounded-md border
                bg-white text-gray-900 border-gray-200
                dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
                focus:ring focus:ring-blue-400 focus:outline-none
              "
            />
          </div>

          {/* LIST */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCategories.map(cat => (
              <label
                key={cat}
                className="
                  flex items-center px-4 py-2 text-sm cursor-pointer
                  text-gray-900 hover:bg-gray-100
                  dark:text-gray-100 dark:hover:bg-gray-800
                "
              >
                <input
                  type="checkbox"
                  checked={value.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="
                    mr-2 accent-blue-500
                  "
                />
                {cat}
              </label>
            ))}
          </div>

          {/* DONE */}
          <div
            onClick={() => setOpen(false)}
            className="
              w-full px-4 py-2 text-sm text-center cursor-pointer
              bg-blue-500 text-white hover:bg-blue-600
            "
          >
            Done
          </div>
        </div>
      )}
    </div>
  )
}
