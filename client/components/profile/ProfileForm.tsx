"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, Save } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  updateProfile,
  uploadProfileImage,
} from "@/lib/store/authSlice";

export default function ProfileForm() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form from user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
      setCity(user.city || "");
      setCountry(user.country || "");
    }
  }, [user]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!user) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setMessage({ type: "error", text: "Only JPEG, PNG, and WebP images are allowed." });
      return;
    }

    // Validate size
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be 5 MB or less." });
      return;
    }

    // Preview
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage(null);

    // Upload immediately
    handleImageUpload(file);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setMessage(null);
    try {
      await dispatch(uploadProfileImage({ file })).unwrap();
      // Update local preview to the Cloudinary URL
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setMessage({ type: "success", text: "Profile photo updated." });
    } catch (err) {
      setMessage({ type: "error", text: typeof err === "string" ? err : "Failed to upload image." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await dispatch(
        updateProfile({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          country: country.trim(),
        })
      ).unwrap();
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: typeof err === "string" ? err : "Failed to update profile." });
    } finally {
      setIsSaving(false);
    }
  };

  const displayImage = previewUrl || user.profileImage || null;
  const initials = (user.firstName?.[0] || user.username?.[0] || "U").toUpperCase();

  const inputClasses =
    "w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] focus:border-transparent transition-all";

  return (
    <div className="max-w-[720px] mx-auto">
      {/* Header - centered */}
      <div className="text-center mb-8">
        <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
          Profile
        </h1>
        {/* <p className="mt-1 text-[14px] text-[#6F6F69]">
          Manage your account information
        </p> */}  
      </div>

      {/* Profile Image Section - centered */}
      <div className="flex flex-col items-center mb-10">  
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-[#F2EFE8] flex items-center justify-center border-2 border-[#E8E6DF]">
            {displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-semibold text-[#96958D]">
                {initials}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center shadow-md hover:bg-[#2a2a2a] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Camera size={14} strokeWidth={2} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
        <p className="mt-3 text-[12px] text-[#96958D]">
          Click the camera icon to change your photo
        </p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 px-4 py-3 rounded-lg text-[13px] ${
            message.type === "success"
              ? "bg-[#F2EFE8] text-[#171717]"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Form - centered */}
      <form onSubmit={handleSave} className="space-y-5">
        {/* Username (read-only) */}
        <div>
          <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
            Username
          </label>
          <input
            type="text"
            value={user.username}
            readOnly
            className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#F5F5F2] text-[14px] text-[#96958D] cursor-not-allowed"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            value={user.email}
            readOnly
            className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#F5F5F2] text-[14px] text-[#96958D] cursor-not-allowed"
          />
        </div>

        {/* First Name + Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              maxLength={50}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              maxLength={50}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            maxLength={30}
            className={inputClasses}
          />
        </div>

        {/* City + Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city"
              maxLength={100}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Enter country"
              maxLength={100}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="w-full h-12 rounded-lg bg-[#171717] text-white text-[14px] font-medium tracking-wide hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} strokeWidth={1.5} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
