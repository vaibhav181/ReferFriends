'use client';

import { useState } from 'react';

export default function ReferCandidateModal({ job, onClose }: any) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    linkedin: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ STEP 1: CONNECT FRONTEND → API
  const handleSendReferral = async () => {
    console.log("Sending referral...");

    if (!formData.candidateEmail || !formData.candidateName) {
      alert("Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/refer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.candidateEmail,
          name: formData.candidateName,
        }),
      });

      const data = await res.json();

      console.log("Response:", data);

      alert("Step 1 working ✅");

      onClose(); // close modal
    } catch (err) {
      console.error(err);
      alert("Error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-lg">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Refer a Candidate</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          <div>
            <label className="text-sm">Job Position</label>
            <input
              value={job?.title || ''}
              disabled
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm">Candidate Name *</label>
            <input
              name="candidateName"
              value={formData.candidateName}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="text-sm">Candidate Email *</label>
            <input
              name="candidateEmail"
              value={formData.candidateEmail}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="text-sm">LinkedIn</label>
            <input
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="linkedin.com/in/..."
            />
          </div>

          <div>
            <label className="text-sm">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Optional message"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-4 pt-4">
            <button
              onClick={onClose}
              className="w-full border py-2 rounded"
            >
              Cancel
            </button>

            <button
              onClick={handleSendReferral}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
            >
              {loading ? "Sending..." : "Send Referral"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}