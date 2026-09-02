"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Newspaper, ImagePlus } from "lucide-react";

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
  createdAt: string;
}

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/store/blogs`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setBlogs(data.blogs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 pt-32 pb-12">
        <h1 className="text-[32px] md:text-[40px] font-semibold text-[#171717] tracking-tight">
          Blog
        </h1>
        <p className="mt-2 text-[15px] text-[#6F6F69] max-w-[600px]">
          Insights, guides and updates from DataTowel on premium cotton textiles
          and bulk supply.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#96958D]" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
            <Newspaper size={40} className="text-[#D8CBB8] mx-auto mb-4" />
            <p className="text-[16px] font-medium text-[#171717] mb-1">
              Unable to load blogs
            </p>
            <p className="text-[13px] text-[#96958D]">{error}</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
            <Newspaper size={40} className="text-[#D8CBB8] mx-auto mb-4" />
            <p className="text-[16px] font-medium text-[#171717] mb-1">
              No blog posts yet
            </p>
            <p className="text-[13px] text-[#96958D]">
              Check back soon for insights and guides.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                onClick={() => router.push(`/blogs/${blog.id}`)}
                className="group bg-white rounded-xl border border-[#E8E6DF]/50 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] bg-[#F2EFE8] overflow-hidden">
                  {blog.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={blog.images[0].url}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImagePlus size={32} className="text-[#D8CBB8]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  {blog.category && (
                    <p className="text-[11px] text-[#96958D] uppercase tracking-wider mb-2">
                      {blog.category}
                    </p>
                  )}
                  <h2 className="text-[16px] font-medium text-[#171717] leading-snug mb-2 line-clamp-2">
                    {blog.title || "Untitled"}
                  </h2>
                  {blog.excerpt && (
                    <p className="text-[13px] text-[#6F6F69] leading-relaxed mb-3 line-clamp-2">
                      {blog.excerpt}
                    </p>
                  )}
                  <p className="text-[12px] text-[#96958D]">
                    {formatDate(blog.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
