'use client'

import React, { useState } from "react";
import { MapPin, Award, Wallet, Calendar } from "lucide-react";

import { Doctor } from "./types";
import { formatCurrency, formatExperience } from "./helpers";
import { DEFAULT_PROFILE_IMAGE } from "@/app/lib/utils";
import { cn } from "@/app/lib/utils";

import RedirectOverlay from "../common/RedirectOverlay";

interface DoctorCardProps {
  doctor: Doctor;

}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const handleBookNow = () => {
    setIsRedirecting(true)
    window.location.href = `/patient/appointments/${doctor.id}`
  }
  return (
    <>
      {isRedirecting && (
        <RedirectOverlay
          title="Redirecting..."
          subtitle={`Taking you to Dr. ${doctor.first_name}'s booking page`}
        />
      )}
      <div className="group bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-cyan-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">

        {/* Header with gradient */}
        <div className="h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 relative">
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <img
                src={doctor.profile_image_url && doctor.profile_image_url.trim() !== ""
                  ? doctor.profile_image_url
                  : DEFAULT_PROFILE_IMAGE
                }
                alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 px-6 pb-6">

          {/* Doctor Info */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Dr. {doctor.first_name} {doctor.last_name}
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
              {doctor.categories.map((cat, idx) => (
                <p key={idx} className="text-cyan-600 font-bold text-xs tracking-wide uppercase">
                  {cat.replace(/_/g, ' ')}
                </p>
              ))}
            </div>


            <div className="flex flex-wrap gap-1.5">
              {doctor.qualifications.map((qual, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full"
                >
                  {qual}
                </span>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatItem
              icon={<Award className="w-4 h-4" />}
              label="Experience"
              value={formatExperience(doctor.experience_years)}
            />
            <StatItem
              icon={<Wallet className="w-4 h-4" />}
              label="Consultation"
              value={formatCurrency(doctor.consultation_fee || 1000)}
            />
            {(doctor.city || doctor.state) &&
              <StatItem
                icon={<MapPin className="w-4 h-4" />}
                label="Location"
                value={`${doctor.city || ''} ${`${doctor.state}` || ""}`}
                fullWidth
              />
            }
          </div>

          {/* About */}
          <div className="mb-5">
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
              {doctor.about}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">

            <button
              onClick={handleBookNow}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group-hover:scale-105 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              Book Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Stat Item Component
interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  fullWidth?: boolean;
}

function StatItem({ icon, label, value, fullWidth }: StatItemProps) {
  return (
    <div className={cn(
      "flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100",
      fullWidth && "col-span-2"
    )}>
      <div className="text-cyan-600 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-semibold mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}