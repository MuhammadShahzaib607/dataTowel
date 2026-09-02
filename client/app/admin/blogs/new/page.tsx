"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  ImagePlus,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import CustomDropdown from "@/components/admin/CustomDropdown";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const BLOG_CATEGORIES = [
  "Towels",
  "Bedsheets",
  "Hospitality",
  "Cleaning",
  "Textile Guide",
  "Business",
  "Tips & Guides",
];

interface BlogForm {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  isActive: boolean;
}

const emptyForm: BlogForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  isActive: true,
};

export default function AddBlogPage() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p));
  }, [previews]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("excerpt", form.excerpt);
      formData.append("content", form.content);
      formData.append("category", form.category);
      formData.append("isActive", String(form.isActive));

      selectedFiles.forEach((f) => formData.append("images", f));

      const res = await fetch(`${API_BASE_URL}/blogs`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.push("/admin/blogs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save blog");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Back + Title */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/admin/blogs")}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6F6F69] hover:text-[#171717] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Blogs
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
          Add Blog
        </h1>
        <p className="mt-1 text-[14px] text-[#6F6F69]">
          Create a new blog post for your website.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Blog Content Card */}
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
              <h2 className="text-[13px] font-semibold text-[#171717] mb-5">
                Blog Content
              </h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                    Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. How to Choose the Perfect Bath Towel"
                    required
                    className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                    Excerpt
                  </label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) =>
                      setForm({ ...form, excerpt: e.target.value })
                    }
                    rows={2}
                    placeholder="A short summary for blog cards..."
                    className="w-full px-4 py-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all resize-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                    Content
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                    rows={16}
                    placeholder="Write your blog content here. Use blank lines for paragraph breaks..."
                    className="w-full px-4 py-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all resize-y min-h-[300px]"
                  />
                </div>
              </div>
            </div>

            {/* Images Card */}
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
              <h2 className="text-[13px] font-semibold text-[#171717] mb-5">
                Images
              </h2>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 h-11 px-4 rounded-lg border border-dashed border-[#E8E6DF] text-[13px] text-[#6F6F69] hover:bg-[#F2EFE8] hover:border-[#D8CBB8] transition-all cursor-pointer w-full justify-center"
              >
                <ImagePlus size={16} strokeWidth={1.5} />
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} file(s) selected`
                  : "Select images"}
              </button>
              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                  {previews.map((p, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg overflow-hidden bg-[#F2EFE8] group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Category Card */}
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
              <h2 className="text-[13px] font-semibold text-[#171717] mb-5">
                Category
              </h2>
              <CustomDropdown
                value={form.category}
                options={BLOG_CATEGORIES.map((c) => ({ label: c, value: c }))}
                placeholder="Select category"
                onChange={(val) => setForm({ ...form, category: val })}
              />
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
              <h2 className="text-[13px] font-semibold text-[#171717] mb-5">
                Status
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, isActive: !form.isActive })
                  }
                  className="cursor-pointer"
                >
                  {form.isActive ? (
                    <ToggleRight
                      size={32}
                      className="text-[#171717]"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <ToggleLeft
                      size={32}
                      className="text-[#96958D]"
                      strokeWidth={1.5}
                    />
                  )}
                </button>
                <span className="text-[13px] text-[#6F6F69]">
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/blogs")}
                className="h-12 px-6 rounded-lg border border-[#E8E6DF] text-[14px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer flex-1 sm:flex-initial"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-12 rounded-lg bg-[#171717] text-white text-[14px] font-medium hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} strokeWidth={1.5} />
                    Publish Blog
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
