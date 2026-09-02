"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Newspaper,
} from "lucide-react";

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
  content: string;
  category: string;
  images: BlogImage[];
  createdAt: string;
}

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/store/blogs/${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBlog(data.blog);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blog");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Preserve paragraphs and line breaks from plain text content
  const renderContent = (content: string) => {
    if (!content) return null;
    return content.split("\n\n").map((paragraph, i) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;
      return (
        <p key={i} className="mb-4 leading-[1.8]">
          {trimmed}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#96958D]" />
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main className="min-h-screen bg-[#FAFAF7]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16 pt-32">
          <button
            onClick={() => router.push("/blogs")}
            className="flex items-center gap-2 text-[13px] font-medium text-[#6F6F69] hover:text-[#171717] transition-colors cursor-pointer mb-8"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Back to Blog
          </button>
          <div className="bg-white rounded-xl border border-[#E8E6DF]/50 p-16 text-center">
            <Newspaper size={40} className="text-[#D8CBB8] mx-auto mb-4" />
            <p className="text-[16px] font-medium text-[#171717] mb-1">
              {error || "Blog post not found"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <article className="max-w-[800px] mx-auto px-6 md:px-16 pt-32 pb-20">
        {/* Back */}
        <button
          onClick={() => router.push("/blogs")}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6F6F69] hover:text-[#171717] transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Blog
        </button>

        {/* Category */}
        {blog.category && (
          <p className="text-[11px] font-semibold text-[#96958D] uppercase tracking-wider mb-3">
            {blog.category}
          </p>
        )}

        {/* Title */}
        <h1 className="text-[28px] md:text-[36px] font-semibold text-[#171717] tracking-tight leading-tight mb-4">
          {blog.title}
        </h1>

        {/* Date */}
        <p className="text-[13px] text-[#96958D] mb-8">
          {formatDate(blog.createdAt)}
        </p>

        {/* Image Gallery */}
        {blog.images.length > 0 && (
          <div className="mb-10">
            {/* Main Image */}
            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#F2EFE8] mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blog.images[activeImageIndex].url}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              {blog.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev > 0
                          ? prev - 1
                          : blog.images.length - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#171717] hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev < blog.images.length - 1
                          ? prev + 1
                          : 0
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#171717] hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              {blog.images.length > 1 && (
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/50 text-white text-[11px] font-medium">
                  {activeImageIndex + 1} / {blog.images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {blog.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {blog.images.map((img, i) => (
                  <button
                    key={img.publicId || i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      i === activeImageIndex
                        ? "border-[#171717]"
                        : "border-transparent hover:border-[#D8CBB8]"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-[17px] text-[#6F6F69] leading-[1.7] mb-8 font-medium">
            {blog.excerpt}
          </p>
        )}

        {/* Content */}
        <div className="prose-custom text-[15px] text-[#171717]">
          {renderContent(blog.content)}
        </div>
      </article>
    </main>
  );
}
