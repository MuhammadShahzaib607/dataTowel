"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Save, CheckCircle } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface BankDetailsForm {
  accountTitle: string;
  bankName: string;
  accountNumber: string;
  iban: string;
}

const emptyForm: BankDetailsForm = {
  accountTitle: "",
  bankName: "",
  accountNumber: "",
  iban: "",
};

export default function AdminSettingsPage() {
  const { token } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState<BankDetailsForm>(emptyForm);
  const [hasExisting, setHasExisting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBankDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/admin/settings/bank-details`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.bankDetails) {
        setForm({
          accountTitle: data.bankDetails.accountTitle || "",
          bankName: data.bankDetails.bankName || "",
          accountNumber: data.bankDetails.accountNumber || "",
          iban: data.bankDetails.iban || "",
        });
        setHasExisting(true);
      } else {
        setHasExisting(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bank details");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBankDetails();
  }, [fetchBankDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Validate all fields
    if (!form.accountTitle.trim() || !form.bankName.trim() || !form.accountNumber.trim() || !form.iban.trim()) {
      setError("All four fields are required.");
      setSaving(false);
      return;
    }

    try {
      const method = hasExisting ? "PUT" : "POST";
      const res = await fetch(`${API_BASE_URL}/admin/settings/bank-details`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          accountTitle: form.accountTitle.trim(),
          bankName: form.bankName.trim(),
          accountNumber: form.accountNumber.trim(),
          iban: form.iban.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setHasExisting(true);
      setSuccess(hasExisting ? "Bank details updated successfully." : "Bank details saved successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save bank details");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#96958D]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-[14px] text-[#6F6F69]">
          Manage your business settings.
        </p>
      </div>

      {/* Success */}
      {success && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-green-50 text-green-700 text-[13px] flex items-center gap-2">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      {/* Bank Details Card */}
      <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6 md:p-8 max-w-[640px]">
        <h2 className="text-[15px] font-semibold text-[#171717] mb-1">
          Bank Details
        </h2>
        <p className="text-[13px] text-[#6F6F69] mb-6">
          Add your bank account details for receiving payments.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                Account Title
              </label>
              <input
                type="text"
                value={form.accountTitle}
                onChange={(e) =>
                  setForm({ ...form, accountTitle: e.target.value })
                }
                placeholder="e.g. DataTowel"
                required
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                Bank Name
              </label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) =>
                  setForm({ ...form, bankName: e.target.value })
                }
                placeholder="e.g. Meezan Bank"
                required
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                Account Number
              </label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) =>
                  setForm({ ...form, accountNumber: e.target.value })
                }
                placeholder="e.g. 0123456789"
                required
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                IBAN
              </label>
              <input
                type="text"
                value={form.iban}
                onChange={(e) =>
                  setForm({ ...form, iban: e.target.value })
                }
                placeholder="e.g. PK00XXXX0000000000000000"
                required
                className={inputClasses}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 h-11 px-6 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {hasExisting ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save size={16} strokeWidth={1.5} />
                  {hasExisting ? "Update Bank Details" : "Save Bank Details"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
