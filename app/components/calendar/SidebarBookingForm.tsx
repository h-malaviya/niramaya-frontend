
'use client'
import React from "react"
import { Paperclip, FileText } from "lucide-react"

interface SidebarBookingFormProps {
  description: string
  files: File[]
  onDescriptionChange: (v: string) => void
  onFilesChange: (files: File[]) => void
}

export default function SidebarBookingForm({
  description,
  files,
  onDescriptionChange,
  onFilesChange
}: SidebarBookingFormProps) {
  return (
    <div className="space-y-4">

      {/* Description */}
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Problem Description
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Briefly describe your symptoms..."
          rows={3}
          className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
        />
      </div>

      {/* File Upload */}
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Upload Reports (Optional)
        </label>

        <label className="mt-2 flex items-center gap-2 cursor-pointer text-sm text-emerald-600 font-semibold hover:underline">
          <Paperclip className="w-4 h-4" />
          Attach files
          <input
            type="file"
            multiple
            hidden
            onChange={(e) => {
              if (!e.target.files) return
              onFilesChange(Array.from(e.target.files))
            }}
          />
        </label>

        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{f.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
