"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  ImagePlus,
  Save,
  ToggleLeft,
  ToggleRight,
  Newspaper,
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

interface ExistingImage {
  url: string;
  publicId: string;
}

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

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/blogs/${params.id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const b = data.blog;
      setForm({
        title: b.title || "",
        excerpt: b.excerpt || "",
        content: b.content || "",
        category: b.category || "",
        isActive: Boolean(b.isActive),
      });
      setExistingImages(Array.isArray(b.images) ? b.images : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blog");
    } finally {
      setLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p));
  }, [previews]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeNewImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingImage = (publicId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
    setRemovedImageIds((prev) => [...prev, publicId]);
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

      if (removedImageIds.length > 0) {
        formData.append("removeImages", JSON.stringify(removedImageIds));
      }

      selectedFiles.forEach((f) => formData.append("images", f));

      const res = await fetch(`${API_BASE_URL}/blogs/${params.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.push("/admin/blogs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update blog");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#96958D]" />
      </div>
    );
  }

  if (error && !form.title && !form.content) {
    return (
      <div>
        <button
          onClick={() => router.push("/admin/blogs")}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6F6F69] hover:text-[#171717] transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Blogs
        </button>
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
          <Newspaper size={40} className="text-[#D8CBB8] mx-auto mb-4" />
          <p className="text-[16px] font-medium text-[#171717] mb-1">
            {error || "Blog not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
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
          Edit Blog
        </h1>
        <p className="mt-1 text-[14px] text-[#6F6F69]">
          Update blog content and settings.
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
              <h2 className="text-[13px] font-semibold text-[#171717] mb-5">
                Blog Content
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                    Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all"
                  />
                </div>
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
                    className="w-full px-4 py-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all resize-none"
                  />
                </div>
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
                    className="w-full px-4 py-3 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] transition-all resize-y min-h-[300px]"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-6">
              <h2 className="text-[13px] font-semibold text-[#171717] mb-5">
                Images
              </h2>

              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-medium text-[#96958D] uppercase tracking-wider mb-3">
                    Current Images
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {existingImages.map((img) => (
                      <div
                        key={img.publicId}
                        className="relative aspect-square rounded-lg overflow-hidden bg-[#F2EFE8] group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt="Blog"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.publicId)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  ? `${selectedFiles.length} new file(s) selected`
                  : "Add new images"}
              </button>
              {previews.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-medium text-[#96958D] uppercase tracking-wider mb-3">
                    New Images
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {previews.map((p, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg overflow-hidden bg-[#F2EFE8] group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p}
                          alt={`New ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
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
                    <ToggleRight size={32} className="text-[#171717]" strokeWidth={1.5} />
                  ) : (
                    <ToggleLeft size={32} className="text-[#96958D]" strokeWidth={1.5} />
                  )}
                </button>
                <span className="text-[13px] text-[#6F6F69]">
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={18} strokeWidth={1.5} />
                    Update Blog
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
