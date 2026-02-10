'use client';

import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Settings, Home, Calendar, Users } from 'lucide-react';

import { ProfileResponse, UserProfile } from '../../types/profile';
import Button from '../ui/Button';
import { clearAuthCookies } from '@/app/lib/authCookies';
import { logoutUser } from '@/app/lib/authApi';
import { getMyProfile } from '@/app/lib/profileApi';
import { usePathname } from 'next/navigation';

interface NavBarProps {
  currentUser?: ProfileResponse;
}

const NavBar = ({ currentUser }: NavBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setRole(localStorage.getItem("role"))
  }, [])
  useEffect(() => {
    // Load user data if not provided
    if (!currentUser) {
      const loadUser = async () => {
        try {
          const response = await getMyProfile();
          if (response.user) {
            setProfile(response);
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      };
      loadUser();
    }
  }, [currentUser]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = async () => {
    const refresh_token = localStorage.getItem('refresh_token')
    setIsLoading(true)
    await logoutUser(refresh_token || '')

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('role')
    clearAuthCookies()
    setIsLoading(false)
    window.location.href = '/login';
  };

  const getNavigationItems = () => {

    if (role === 'doctor') {
      return [
        { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
        { name: 'Dashboard', href: '/doctor/analytics', icon: Home },
      ]
    } else {
      return [

        { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
        { name: 'Doctors', href: '/patient/doctors', icon: Users },
      ];
    }
  };

  const navigationItems = getNavigationItems();
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Niramaya
              </h1>
              <p className="text-xs text-gray-600 -mt-1 font-medium">
                Doctor Patient Appointment System
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-sm
                        ${pathname.startsWith(item.href)
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Desktop Profile Dropdown */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center max-w-xs bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:shadow-md transition-all duration-200"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  {profile?.user.profile_image_url ? (
                    <img
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-100"
                      src={profile.user.profile_image_url}
                      alt={`${profile.user.first_name} ${profile.user.last_name}`}
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center ring-2 ring-blue-100">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  <span className="ml-3 text-sm font-semibold text-gray-800">
                    {profile?.user ? `${profile?.user.first_name} ${profile?.user.last_name}` : 'Loading...'}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1" role="menu">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b">
                        {profile?.user.email}
                      </div>
                      <a
                        href={`/${role}/profile`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </a>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        {isLoading ? "Signing out..." : "Sign out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-all
                  ${pathname.startsWith(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }
                `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              );
            })}
          </div>

          {/* Mobile profile section */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5">
              {profile?.user.profile_image_url ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={profile?.user.profile_image_url}
                  alt={`${profile?.user.first_name} ${profile?.user.last_name}`}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              )}
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {profile?.user ? `${profile?.user.first_name} ${profile?.user.last_name}` : 'Loading...'}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {profile?.user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <a
                href={`/${role}/profile`}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-5 h-5 mr-3" />
                Profile
              </a>
              <a
                href="/settings"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(isMenuOpen || isProfileDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsMenuOpen(false);
            setIsProfileDropdownOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default NavBar;