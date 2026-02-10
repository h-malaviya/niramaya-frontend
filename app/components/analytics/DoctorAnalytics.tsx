"use client"

import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import api from '@/app/lib/apiClient'
import { Activity, TrendingUp, Users, Clock } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

type TimeRange = 'today' | 'week' | 'month' | 'year'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
  }[]
}

const TimeRangeSelector = ({ 
  activeRange, 
  onChange 
}: { 
  activeRange: TimeRange
  onChange: (range: TimeRange) => void 
}) => {
  const ranges: TimeRange[] = ['today', 'week', 'month', 'year']
  
  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
      {ranges.map(range => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
            activeRange === range
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {range.charAt(0).toUpperCase() + range.slice(1)}
        </button>
      ))}
    </div>
  )
}

export default function DoctorAnalytics() {
  const [revenueRange, setRevenueRange] = useState<TimeRange>('month')
  const [statusRange, setStatusRange] = useState<TimeRange>('month')
  const [customersRange, setCustomersRange] = useState<TimeRange>('month')
  const [peakHoursRange, setPeakHoursRange] = useState<TimeRange>('month')

  const [revenueData, setRevenueData] = useState<ChartData | null>(null)
  const [statusData, setStatusData] = useState<ChartData | null>(null)
  const [customersData, setCustomersData] = useState<ChartData | null>(null)
  const [peakHoursData, setPeakHoursData] = useState<ChartData | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRevenue()
  }, [revenueRange])

  useEffect(() => {
    fetchStatus()
  }, [statusRange])

  useEffect(() => {
    fetchCustomers()
  }, [customersRange])

  useEffect(() => {
    fetchPeakHours()
  }, [peakHoursRange])

  const fetchRevenue = async () => {
    try {
      const res = await api.get(`/doctors/analytics/revenue?range=${revenueRange}`)
      setRevenueData(res.data)
    } catch (error) {
      console.error('Failed to fetch revenue:', error)
    }
  }

  const fetchStatus = async () => {
    try {
      const res = await api.get(`/doctors/analytics/appointments-status?range=${statusRange}`)
      setStatusData(res.data)
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/doctors/analytics/customers?range=${customersRange}`)
      setCustomersData(res.data)
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPeakHours = async () => {
    try {
      const res = await api.get(`/doctors/analytics/peak-hours?range=${peakHoursRange}`)
      setPeakHoursData(res.data)
    } catch (error) {
      console.error('Failed to fetch peak hours:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slat-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-white/20 animate-ping"></div>
          <div className="w-16 h-16 rounded-full bg-white/30 animate-pulse absolute top-0 left-0"></div>
        </div>
      </div>
    )
  }

  const revenueChartData = revenueData ? {
    labels: revenueData.labels,
    datasets: [{
      label: revenueData.datasets[0]?.label || 'Revenue',
      data: revenueData.datasets[0]?.data || [],
      backgroundColor: 'rgba(14, 165, 233, 0.8)',
      borderColor: '#0EA5E9',
      borderWidth: 1,
    }]
  } : null

  const statusChartData = statusData ? {
    labels: statusData.labels.map(l => 
      l.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    ),
    datasets: [{
      label: 'Appointments',
      data: statusData.datasets[0]?.data || [],
      backgroundColor: [
        '#10B981',
        '#F59E0B',
        '#EF4444',
        '#8B5CF6',
      ],
      borderWidth: 0,
    }]
  } : null

  const customersChartData = customersData ? {
    labels: customersData.labels,
    datasets: [{
      label: customersData.datasets[0]?.label || 'Customers',
      data: customersData.datasets[0]?.data || [],
      backgroundColor: ['#06B6D4', '#0EA5E9'],
      borderWidth: 0,
    }]
  } : null

  const peakHoursChartData = peakHoursData ? {
    labels: peakHoursData.labels,
    datasets: [{
      label: peakHoursData.datasets[0]?.label || 'Appointments',
      data: peakHoursData.datasets[0]?.data || [],
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      borderColor: '#8B5CF6',
      borderWidth: 1,
    }]
  } : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 14,
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#64748B',
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#64748B',
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          font: {
            size: 12,
          },
          color: '#475569',
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 14,
        },
      }
    },
    cutout: '65%',
  }
  return (
    <div className="min-h-screen bg-slat-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 tracking-tight">
            Analytics Dashboard
          </h1>
          <p className=" text-gray-800 text-base sm:text-lg">
            Track your practice performance and insights
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Revenue Chart */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-5 sm:p-7 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-slideUp">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-6 transition-transform duration-300">
                  <TrendingUp className="text-white" size={22} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Revenue</h2>
              </div>
              <TimeRangeSelector activeRange={revenueRange} onChange={setRevenueRange} />
            </div>
            <div className="h-72 relative">
              {revenueChartData && (
                <Bar data={revenueChartData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Appointments Status */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-5 sm:p-7 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-6 transition-transform duration-300">
                  <Activity className="text-white" size={22} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Appointment Status</h2>
              </div>
              <TimeRangeSelector activeRange={statusRange} onChange={setStatusRange} />
            </div>
            <div className="h-72 relative">
              {statusChartData && (
                <Doughnut data={statusChartData} options={doughnutOptions} />
              )}
            </div>
          </div>

          {/* Customers */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-5 sm:p-7 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-6 transition-transform duration-300">
                  <Users className="text-white" size={22} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Patient Metrics</h2>
              </div>
              <TimeRangeSelector activeRange={customersRange} onChange={setCustomersRange} />
            </div>
            <div className="h-72 relative">
              {customersChartData && (
                <Doughnut data={customersChartData} options={doughnutOptions} />
              )}
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-5 sm:p-7 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-6 transition-transform duration-300">
                  <Clock className="text-white" size={22} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Peak Hours</h2>
              </div>
              <TimeRangeSelector activeRange={peakHoursRange} onChange={setPeakHoursRange} />
            </div>
            <div className="h-72 relative">
              {peakHoursChartData && (
                <Bar data={peakHoursChartData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out backwards;
        }
      `}</style>
    </div>
  )
}