"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Loader2,
  Trash2,
  X,
  ImagePlus,
  Newspaper,
  Pencil,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface BlogImage {
  url: string;
  publicId: string;
}

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  images: BlogImage[];
  isActive: boolean;
  createdAt: string;
}

export default function AdminBlogsPage() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/blogs`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBlogs(data.blogs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDeleteConfirm(null);
      fetchBlogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete blog");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/${id}/status`, {
        method: "PATCH",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchBlogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
            Blogs
          </h1>
          <p className="mt-1 text-[14px] text-[#6F6F69]">
            {blogs.length} blog{blogs.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/blogs/new")}
          className="flex items-center gap-2 h-10 px-5 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] transition-all cursor-pointer"
        >
          <Plus size={16} strokeWidth={1.5} />
          Add Blog
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-[13px] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-2xl p-8 text-center">
                <h3 className="text-[18px] font-semibold text-[#171717] mb-2">
                  Delete this blog?
                </h3>
                <p className="text-[13px] text-[#6F6F69] mb-6">
                  This action cannot be undone. Associated images will also be
                  removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 h-11 rounded-lg border border-[#E8E6DF] text-[13px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 h-11 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Blogs List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#96958D]" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
          <Newspaper size={40} className="text-[#D8CBB8] mx-auto mb-4" />
          <p className="text-[16px] font-medium text-[#171717] mb-1">
            No blogs yet
          </p>
          <p className="text-[13px] text-[#96958D] mb-6">
            Add your first blog to get started.
          </p>
          <button
            onClick={() => router.push("/admin/blogs/new")}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#171717] text-white text-[13px] font-medium hover:bg-[#2a2a2a] transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={1.5} />
            Add Blog
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-[#E8E6DF]/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E6DF]/50">
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Blog
                  </th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-[11px] font-semibold text-[#96958D] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="border-b border-[#E8E6DF]/30 last:border-0 hover:bg-[#FAFAF7] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F2EFE8] flex-shrink-0">
                          {blog.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={blog.images[0].url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImagePlus size={14} className="text-[#D8CBB8]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[#171717] truncate max-w-[300px]">
                            {blog.title || "Untitled"}
                          </p>
                          {blog.excerpt && (
                            <p className="text-[11px] text-[#96958D] truncate max-w-[300px]">
                              {blog.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] text-[#6F6F69]">
                        {blog.category || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] text-[#6F6F69]">
                        {formatDate(blog.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(blog.id)}
                        className="cursor-pointer"
                      >
                        {blog.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-[#96958D] text-[11px] font-medium">
                            Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            router.push(`/admin/blogs/${blog.id}/edit`)
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-[#F2EFE8] hover:text-[#171717] transition-colors cursor-pointer"
                          title="Edit blog"
                        >
                          <Pencil size={15} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(blog.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6F6F69] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-xl border border-[#E8E6DF]/50 p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F2EFE8] flex-shrink-0">
                    {blog.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={blog.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImagePlus size={16} className="text-[#D8CBB8]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#171717] truncate">
                      {blog.title || "Untitled"}
                    </p>
                    <p className="text-[12px] text-[#96958D]">
                      {blog.category || "No category"} · {formatDate(blog.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(blog.id)}
                    className="cursor-pointer flex-shrink-0"
                  >
                    {blog.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-[#96958D] text-[10px] font-medium">
                        Inactive
                      </span>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/admin/blogs/${blog.id}/edit`)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#E8E6DF] text-[12px] font-medium text-[#6F6F69] hover:bg-[#FAFAF7] transition-all cursor-pointer"
                  >
                    <Pencil size={13} strokeWidth={1.5} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(blog.id)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#E8E6DF] text-[12px] font-medium text-[#6F6F69] hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} strokeWidth={1.5} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
