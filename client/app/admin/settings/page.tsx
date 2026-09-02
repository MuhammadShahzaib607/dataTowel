"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Save, CheckCircle, Truck } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface BankDetailsForm {
  accountTitle: string;
  bankName: string;
  accountNumber: string;
  iban: string;
}

interface DeliveryForm {
  karachiCharge: string;
  outsideKarachiCharge: string;
}

const emptyBankForm: BankDetailsForm = {
  accountTitle: "",
  bankName: "",
  accountNumber: "",
  iban: "",
};

const emptyDeliveryForm: DeliveryForm = {
  karachiCharge: "300",
  outsideKarachiCharge: "500",
};

export default function AdminSettingsPage() {
  const { token } = useAppSelector((state) => state.auth);
  const [bankForm, setBankForm] = useState<BankDetailsForm>(emptyBankForm);
  const [hasExistingBank, setHasExistingBank] = useState(false);
  const [bankLoading, setBankLoading] = useState(true);
  const [bankSaving, setBankSaving] = useState(false);

  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>(emptyDeliveryForm);
  const [hasExistingDelivery, setHasExistingDelivery] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(true);
  const [deliverySaving, setDeliverySaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Fetch bank details
  const fetchBankDetails = useCallback(async () => {
    try {
      setBankLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/settings/bank-details`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.bankDetails) {
        setBankForm({
          accountTitle: data.bankDetails.accountTitle || "",
          bankName: data.bankDetails.bankName || "",
          accountNumber: data.bankDetails.accountNumber || "",
          iban: data.bankDetails.iban || "",
        });
        setHasExistingBank(true);
      } else {
        setHasExistingBank(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bank details");
    } finally {
      setBankLoading(false);
    }
  }, [token]);

  // Fetch delivery settings
  const fetchDeliverySettings = useCallback(async () => {
    try {
      setDeliveryLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/settings/delivery`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.deliverySettings) {
        setDeliveryForm({
          karachiCharge: String(data.deliverySettings.karachiCharge ?? 300),
          outsideKarachiCharge: String(data.deliverySettings.outsideKarachiCharge ?? 500),
        });
        setHasExistingDelivery(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load delivery settings");
    } finally {
      setDeliveryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBankDetails();
    fetchDeliverySettings();
  }, [fetchBankDetails, fetchDeliverySettings]);

  // Save bank details
  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankSaving(true);
    setError("");
    setSuccess("");

    if (!bankForm.accountTitle.trim() || !bankForm.bankName.trim() || !bankForm.accountNumber.trim() || !bankForm.iban.trim()) {
      setError("All four bank fields are required.");
      setBankSaving(false);
      return;
    }

    try {
      const method = hasExistingBank ? "PUT" : "POST";
      const res = await fetch(`${API_BASE_URL}/admin/settings/bank-details`, {
        method,
        headers: authHeaders,
        body: JSON.stringify({
          accountTitle: bankForm.accountTitle.trim(),
          bankName: bankForm.bankName.trim(),
          accountNumber: bankForm.accountNumber.trim(),
          iban: bankForm.iban.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setHasExistingBank(true);
      setSuccess("Bank details saved successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save bank details");
    } finally {
      setBankSaving(false);
    }
  };

  // Save delivery settings
  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeliverySaving(true);
    setError("");
    setSuccess("");

    const karachi = Number(deliveryForm.karachiCharge);
    const outside = Number(deliveryForm.outsideKarachiCharge);

    if (isNaN(karachi) || karachi < 0 || isNaN(outside) || outside < 0) {
      setError("Delivery charges must be non-negative numbers.");
      setDeliverySaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings/delivery`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          karachiCharge: karachi,
          outsideKarachiCharge: outside,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setHasExistingDelivery(true);
      setSuccess("Delivery charges updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save delivery settings");
    } finally {
      setDeliverySaving(false);
    }
  };

  const inputClasses =
    "w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all";

  const isLoading = bankLoading || deliveryLoading;

  if (isLoading) {
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

      <div className="space-y-8">
        {/* Bank Details Card */}
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6 md:p-8 max-w-[640px]">
          <h2 className="text-[15px] font-semibold text-[#171717] mb-1">
            Bank Details
          </h2>
          <p className="text-[13px] text-[#6F6F69] mb-6">
            Add your bank account details for receiving payments.
          </p>

          <form onSubmit={handleBankSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                  Account Title
                </label>
                <input
                  type="text"
                  value={bankForm.accountTitle}
                  onChange={(e) => setBankForm({ ...bankForm, accountTitle: e.target.value })}
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
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
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
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
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
                  value={bankForm.iban}
                  onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                  placeholder="e.g. PK00XXXX0000000000000000"
                  required
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={bankSaving}
                className="flex items-center gap-2 h-11 px-6 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {bankSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {hasExistingBank ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save size={16} strokeWidth={1.5} />
                    {hasExistingBank ? "Update Bank Details" : "Save Bank Details"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Delivery Charges Card */}
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6 md:p-8 max-w-[640px]">
          <div className="flex items-center gap-3 mb-1">
            <Truck size={18} className="text-[#6F6F69]" />
            <h2 className="text-[15px] font-semibold text-[#171717]">
              Delivery Charges
            </h2>
          </div>
          <p className="text-[13px] text-[#6F6F69] mb-6">
            Configure delivery charges by city. Karachi gets a different rate than other cities.
          </p>

          <form onSubmit={handleDeliverySubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                  Karachi Delivery (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={deliveryForm.karachiCharge}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, karachiCharge: e.target.value })}
                  placeholder="e.g. 300"
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                  Outside Karachi (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={deliveryForm.outsideKarachiCharge}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, outsideKarachiCharge: e.target.value })}
                  placeholder="e.g. 500"
                  required
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={deliverySaving}
                className="flex items-center gap-2 h-11 px-6 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {deliverySaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} strokeWidth={1.5} />
                    Update Delivery Charges
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
