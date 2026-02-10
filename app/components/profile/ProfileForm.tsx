'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ProfileFormData, ProfileResponse, UpdateProfilePayload } from '../../types/profile';
import {  useToastContext } from '../../lib/hooks/useToast';
import { ProfileSkeleton } from '../ui/LoadingSkeleton';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import ProfileImageUpload from './ProfileImageUpload';

import { Save, User, MapPin, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { getMyProfile, updateProfile, uploadProfileImage } from '@/app/lib/profileApi';
import { debug } from 'util';

const ProfileForm = () => {

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: showError } = useToastContext();
  const [profile, setProfile] = useState<ProfileResponse | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue
  } = useForm<ProfileFormData>()


  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)

        const data = await getMyProfile()
        setProfile(data)

        reset({
          firstName: data.user.first_name,
          lastName: data.user.last_name,
          dateOfBirth: data.user.date_of_birth,
          gender: data.user.gender,
          phone: data.user.phone_number ?? "",
          address: data.user.address ?? "",
          city: data.user.city ?? "",
          state: data.user.state ?? "",
          country: data.user.country ?? "",

          ...(data.doctor_profile && {
            experience: data.doctor_profile.experience_years,
            about: data.doctor_profile.about ?? "",
            fees: data.doctor_profile.consultation_fee ?? 0,
            category: data.doctor_profile.qualifications?.[0] ?? ""
          })
        })
      } catch {
        showError("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [reset])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSubmitting(true)

      const payload: UpdateProfilePayload = {
        user: {
          first_name: data.firstName,
          last_name: data.lastName,
          gender: data.gender,
          date_of_birth: data.dateOfBirth,
          phone_number: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          profile_image_url: profile?.user.profile_image_url,
        },
      }

      // 👨‍⚕️ Doctor-specific block
      if (profile?.doctor_profile) {
        payload.doctor = {
          experience_years: data.experience,
          consultation_fee: data.fees,
          about: data.about,
          qualifications: data.category
            ? [data.category]
            : undefined,
        }
      }
      const updated = await updateProfile(payload)

      // ✅ Update local profile state
      setProfile(updated)

      // ✅ Reset form with updated values
      reset({
        firstName: updated.user.first_name,
        lastName: updated.user.last_name,
        dateOfBirth: updated.user.date_of_birth,
        gender: updated.user.gender,
        phone: updated.user.phone_number ?? "",
        address: updated.user.address ?? "",
        city: updated.user.city ?? "",
        state: updated.user.state ?? "",
        country: updated.user.country ?? "",

        ...(updated.doctor_profile && {
          experience: updated.doctor_profile.experience_years,
          about: updated.doctor_profile.about ?? "",
          fees: updated.doctor_profile.consultation_fee ?? 0,
          category: updated.doctor_profile.qualifications?.[0] ?? "",
        }),
      })

      success("Profile updated successfully")
    } catch (err: any) {
      showError(err?.message || "Failed to update profile")
    } finally {
      setSubmitting(false)
    }
  }


  const handleImageUpload = async (file: File) => {
    try {
      const res = await uploadProfileImage(file)

      // 🔥 Update profile image locally (no refetch needed)
      setProfile((prev) => {
        if (!prev) return prev

        return {
          ...prev,
          user: {
            ...prev.user,
            profile_image_url: res.image_url,
          },
        }
      })

      success(res.message || "Profile image updated successfully")
    } catch (err: any) {
      showError(err?.message || "Failed to upload image. Please try again.")
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
          <p className="text-gray-800 text-lg font-medium">Failed to load profile data.</p>
          <Button onClick={() => window.location.reload()} className="mt-6">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 animate-fade-in-up">
      {/* Profile Image Section */}
      <div className="flex justify-center animate-bounce-gentle">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg">
          <ProfileImageUpload
            currentImage={profile?.user.profile_image_url || ""}
            onImageUpload={handleImageUpload}
            userName={`${profile.user.first_name} ${profile.user.last_name}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Personal Information */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 space-y-6 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-in-right">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              {...register('firstName')}
              error={errors.firstName?.message}
              required
              fullWidth
            />
            <Input
              label="Last Name"
              {...register('lastName')}
              error={errors.lastName?.message}
              required
              fullWidth
            />
          </div>

          <Input
            label="Date of Birth"
            type="date"
            {...register('dateOfBirth')}
            error={errors.dateOfBirth?.message}
            required
            fullWidth
          />

          <Select
            label="Gender"
            options={genderOptions}
            {...register('gender')}
            error={errors.gender?.message}
            placeholder="Select gender"
            required
            fullWidth
          />

          <Input
            label="Email"
            type="email"
            value={profile.user.email}
            disabled
            helperText="Email cannot be changed"
            fullWidth
          />
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 space-y-6 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-green-100 p-2 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
          </div>

          <Input
            label="Phone Number"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
            placeholder="+1 (555) 123-4567"
            fullWidth
          />

          <Input
            label="Address"
            {...register('address')}
            error={errors.address?.message}
            placeholder="Street address"
            fullWidth
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              {...register('city')}
              error={errors.city?.message}
              fullWidth
            />
            <Input
              label="State"
              {...register('state')}
              error={errors.state?.message}
              fullWidth
            />
          </div>

          <Input
            label="Country"
            {...register('country')}
            error={errors.country?.message}
            fullWidth
          />
        </div>
      </div>

      {/* Doctor-specific fields */}
      {profile?.doctor_profile && (
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-8 border-t-4 border-purple-500 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-purple-100 p-2 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Professional Information</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


            <Input
              label="Consultation Fees ($)"
              type="number"
              {...register('fees', { valueAsNumber: true })}
              error={errors.fees?.message}
              placeholder="150"
              min="0"
              step="0.01"
              required
              fullWidth
            />

            <Input
              label="Years of Experience"
              type="number"
              {...register('experience', { valueAsNumber: true })}
              error={errors.experience?.message}
              placeholder="5"
              min="0"
              max="50"
              fullWidth
            />

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                About
              </label>
              <textarea
                {...register('about')}
                rows={4}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white text-gray-900 transition-all duration-200"
                placeholder="Tell patients about yourself, your specializations, and experience..."
              />
              {errors.about && (
                <p className="mt-2 text-sm text-red-700 font-medium">{errors.about.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={!isDirty || submitting}
            size="lg"
          >
            Reset Changes
          </Button>
          <Button
            type="submit"
            loading={submitting}
            disabled={!isDirty}
            size="lg"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;