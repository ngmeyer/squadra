'use client'

import { useEffect, useState } from 'react'

interface CountdownProps {
  targetDate: Date
  onComplete?: () => void
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function Countdown({ targetDate, onComplete }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const calculateTimeRemaining = (): TimeRemaining | null => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference <= 0) {
        return null
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      }
    }

    // Initial calculation
    const initial = calculateTimeRemaining()
    if (!initial) {
      setIsComplete(true)
      onComplete?.()
      return
    }
    setTimeRemaining(initial)

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining()
      
      if (!remaining) {
        setIsComplete(true)
        setTimeRemaining(null)
        clearInterval(interval)
        onComplete?.()
      } else {
        setTimeRemaining(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate, onComplete])

  if (isComplete) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-xl font-bold text-red-800">Campaign Closed</p>
        <p className="text-sm text-red-600 mt-2">This preorder campaign has ended</p>
      </div>
    )
  }

  if (!timeRemaining) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
      <p className="text-sm font-medium text-gray-700 text-center mb-3">Time Remaining</p>
      <div className="grid grid-cols-4 gap-4">
        <TimeBlock value={timeRemaining.days} label="Days" />
        <TimeBlock value={timeRemaining.hours} label="Hours" />
        <TimeBlock value={timeRemaining.minutes} label="Minutes" />
        <TimeBlock value={timeRemaining.seconds} label="Seconds" />
      </div>
    </div>
  )
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-white rounded-lg p-3 shadow-sm">
        <p className="text-3xl font-bold text-gray-900">{value.toString().padStart(2, '0')}</p>
      </div>
      <p className="text-xs text-gray-600 mt-1 font-medium">{label}</p>
    </div>
  )
}
