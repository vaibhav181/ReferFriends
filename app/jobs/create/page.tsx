"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Card } from "@/components/Card"
import Link from "next/link"

export default function CreateJobPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company_name: "",
    location: "",
    job_type: "full-time",
    salary_min: "",
    salary_max: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // ✅ STEP 1: Always get user first
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      console.log("USER:", user)

      if (userError || !user) {
        alert("You are not logged in. Please login again.")
        setLoading(false)
        return
      }

      // ✅ STEP 2: Get session AFTER confirming user
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const token = session?.access_token

      console.log("TOKEN:", token)

      if (!token) {
        alert("Session expired. Please login again.")
        setLoading(false)
        return
      }

      // ✅ STEP 3: Send request
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          company_name: formData.company_name,
          location: formData.location,
          job_type: formData.job_type,
          salary_min: formData.salary_min ? Number(formData.salary_min) : null,
          salary_max: formData.salary_max ? Number(formData.salary_max) : null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create job")
      }

      alert("Job posted successfully 🚀")
      router.push("/jobs")

    } catch (error: any) {
      console.error("ERROR:", error)
      setError(error.message || "Failed to post job")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-[#64748B]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Card padding="lg" className="text-center max-w-md">
          <div className="text-5xl mb-4">🔐</div>
          <p className="text-lg font-semibold text-[#0F172A] mb-4">Not signed in</p>
          <p className="text-[#64748B] mb-6">You must be signed in to post a job.</p>
          <Link href="/auth/signin">
            <Button variant="primary" fullWidth>
              Sign In
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/jobs" className="inline-flex items-center gap-2 text-[#2563EB] hover:text-[#4F46E5] transition mb-6 font-semibold">
          ← Back to Jobs
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0F172A] mb-2">📋 Post a Job</h1>
          <p className="text-[#64748B]">Fill in the details below to create a new job posting.</p>
        </div>

        {/* Form Card */}
        <Card padding="lg">
          {error && (
            <div className="mb-6 p-4 bg-[#FEE2E2] border-2 border-[#FECACA] text-[#991B1B] rounded-xl text-sm font-medium">
              ✕ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <Input
              label="Job Title"
              type="text"
              name="title"
              value={formData.title}
              placeholder="e.g., Senior React Developer"
              icon="💼"
              required
              onChange={handleChange}
            />

            {/* Company Name */}
            <Input
              label="Company Name"
              type="text"
              name="company_name"
              value={formData.company_name}
              placeholder="Your company name"
              icon="🏢"
              required
              onChange={handleChange}
            />

            {/* Location */}
            <Input
              label="Location"
              type="text"
              name="location"
              value={formData.location}
              placeholder="e.g., San Francisco, CA"
              icon="📍"
              required
              onChange={handleChange}
            />

            {/* Job Type */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Job Type <span className="text-[#EF4444]">*</span>
              </label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 bg-white text-[#0F172A]"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Salary"
                type="number"
                name="salary_min"
                value={formData.salary_min}
                placeholder="e.g., 80000"
                icon="💵"
                onChange={handleChange}
              />
              <Input
                label="Max Salary"
                type="number"
                name="salary_max"
                value={formData.salary_max}
                placeholder="e.g., 120000"
                icon="💵"
                onChange={handleChange}
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Job Description <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={6}
                className="w-full px-4 py-3 border-2 border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 bg-white text-[#0F172A] resize-none"
                required
              />
              <p className="text-xs text-[#64748B] mt-1">Provide clear details about the position</p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
              >
                🚀 Post Job
              </Button>
              <Link href="/jobs" className="flex-none">
                <Button variant="secondary" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
}