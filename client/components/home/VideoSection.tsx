"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { siteContent } from "@/lib/data/content";

const { video: videoContent } = siteContent;

export default function VideoSection() {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section
      ref={ref}
      className="py-20 md:py-32 px-10 md:px-16"
      style={{ background: "#F7F4ED" }}
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-[#96958D] mb-4"
        >
          {videoContent.eyebrow}
        </motion.p>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative aspect-video rounded-2xl overflow-hidden bg-[#2a2520]"
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster={videoContent.poster}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoContent.src} type="video/mp4" />
          </video>

          {/* Play/Pause Control */}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className="absolute bottom-6 right-6 z-10 w-11 h-11 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
          >
            {isPlaying ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 35%)",
            }}
          />
        </motion.div>

        {/* Caption */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-6 text-[14px] text-[#6F6F69]"
        >
          {videoContent.heading}
        </motion.p>
      </div>
    </section>
  );
}
