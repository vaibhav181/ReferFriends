"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function CreateJobPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [company_name, setCompanyName] = useState("")
  const [location, setLocation] = useState("")
  const [job_type, setJobType] = useState("full-time")
  const [salary_min, setSalaryMin] = useState("")
  const [salary_max, setSalaryMax] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          title,
          description,
          company_name,
          location,
          job_type,
          salary_min: salary_min ? Number(salary_min) : null,
          salary_max: salary_max ? Number(salary_max) : null,
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
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Post a Job</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <textarea
          placeholder="Job Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Company Name"
          value={company_name}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <select
          value={job_type}
          onChange={(e) => setJobType(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="temporary">Temporary</option>
        </select>

        <input
          type="number"
          placeholder="Minimum Salary"
          value={salary_min}
          onChange={(e) => setSalaryMin(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Maximum Salary"
          value={salary_max}
          onChange={(e) => setSalaryMax(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  )
}