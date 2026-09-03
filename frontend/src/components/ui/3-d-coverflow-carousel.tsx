"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

// Inline Icons (Zero external dependencies)
const ChevronLeftIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export interface CarouselItem {
  id?: string;
  tag?: string;
  titleLine1: string;
  titleLine2?: string;
  desc?: string;
  img: string;
  ctaText?: string;
  ctaUrl?: string;
  tabTarget?: string;
}

export interface CoverFlowCarouselProps {
  items?: CarouselItem[];
  sectionLabel?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  onCtaClick?: (item: CarouselItem) => void;
  onSelectTool?: (toolId: string) => void;
}

export const defaultAuditPipelineItems: CarouselItem[] = [
  {
    id: "databases",
    tabTarget: "databases",
    tag: "#Stage01 • INGESTION",
    titleLine1: "UNIVERSAL DATABASE INGESTION",
    titleLine2: "– MULTI-SCHEMA DISCOVERY",
    desc: "Autonomous connection & introspective schema parsing across SQLite, Postgres, CSV, and XLSX formats.",
    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
    ctaText: "Launch Ingestion (01)",
    ctaUrl: "#databases",
  },
  {
    id: "dataquality",
    tabTarget: "dataquality",
    tag: "#Stage02 • QUALITY",
    titleLine1: "DATA INTEGRITY & PROFILING",
    titleLine2: "– 0-100 HEALTH INDEX",
    desc: "Autonomous null diagnostics, duplicate row scoring, temporal consistency, and semantic entity mapping.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    ctaText: "Run Diagnostics (02)",
    ctaUrl: "#dataquality",
  },
  {
    id: "reconciliation",
    tabTarget: "reconciliation",
    tag: "#Stage03 • RECONCILIATION",
    titleLine1: "SETTLEMENT RECONCILIATION",
    titleLine2: "– DUAL LEDGER AUDITING",
    desc: "Cross-checks bank gateway clearing payouts against internal ledger numbers, pinpointing exact discrepancies.",
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
    ctaText: "Reconcile Settlements (03)",
    ctaUrl: "#reconciliation",
  },
  {
    id: "anomalies",
    tabTarget: "anomalies",
    tag: "#Stage04 • FRAUD CENTER",
    titleLine1: "HYBRID ML FRAUD CENTER",
    titleLine2: "– ISOLATION FOREST ML",
    desc: "Unsupervised statistical outlier scoring combined with deterministic duplicate payouts and refund spikes.",
    img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    ctaText: "Detect Outliers (04)",
    ctaUrl: "#anomalies",
  },
  {
    id: "merchants",
    tabTarget: "merchants",
    tag: "#Stage05 • RISK DOSSIERS",
    titleLine1: "MERCHANT RISK DOSSIERS",
    titleLine2: "– 5-FACTOR MODEL (0-100)",
    desc: "Continuous composite risk index factoring dispute volumes, refund rates, failure velocity, and payout variances.",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    ctaText: "Inspect Dossiers (05)",
    ctaUrl: "#merchants",
  },
  {
    id: "controller",
    tabTarget: "controller",
    tag: "#Stage06 • AI CONTROLLER",
    titleLine1: "COGNITIVE AI CONTROLLER",
    titleLine2: "– NVIDIA LLAMA 3.3 70B",
    desc: "Conversational controllership with schema-grounded SQL generation, autonomous self-correction, and full trace audit.",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80",
    ctaText: "Interrogate AI (06)",
    ctaUrl: "#controller",
  },
  {
    id: "reports",
    tabTarget: "reports",
    tag: "#Stage07 • CERTIFICATION",
    titleLine1: "EXECUTIVE AUDIT REPORT",
    titleLine2: "– CERTIFIED ATTESTATION",
    desc: "Signed executive audit dossier, What-If resilience simulation, and one-click PDF/Excel export packages.",
    img: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80",
    ctaText: "Generate Certificate (07)",
    ctaUrl: "#reports",
  },
];

export function CoverFlowCarousel({
  items = defaultAuditPipelineItems,
  sectionLabel = "AUTONOMOUS AUDIT PIPELINE • 7-STAGE INTELLIGENCE SUITE",
  autoplay = true,
  autoplayDelay = 4500,
  className = "",
  onCtaClick,
  onSelectTool,
}: CoverFlowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const total = items.length;

  const handleAction = (item: CarouselItem) => {
    if (onCtaClick) {
      onCtaClick(item);
    } else if (onSelectTool && (item.tabTarget || item.id)) {
      onSelectTool(item.tabTarget || item.id || "");
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx % total);
  };

  useEffect(() => {
    if (!autoplay || isHovered || total <= 1) return;
    const interval = setInterval(nextSlide, autoplayDelay);
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isHovered, nextSlide, total]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 45) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section
      className={`relative w-full min-h-[720px] flex items-center justify-center overflow-hidden py-12 select-none rounded-3xl border border-white/[0.1] shadow-2xl ${className}`}
      style={{
        backgroundColor: "#080c16",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <img
          src={items[currentIndex]?.img}
          alt="ambience background"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.22) blur(36px)",
            transform: "scale(1.15)",
            transition: "opacity 1000ms ease, filter 1000ms ease",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, rgba(8,12,22,0.4) 0%, rgba(8,12,22,0.95) 100%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 z-10 flex flex-col items-center">
        {/* Eyebrow */}
        {sectionLabel && (
          <div className="flex items-center gap-3 mb-8">
            <span style={{ width: "36px", height: "1px", background: "linear-gradient(90deg, transparent, #3B82F6)" }} />
            <h3
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#3B82F6",
                margin: 0,
                fontFamily: "monospace",
              }}
            >
              {sectionLabel}
            </h3>
            <span style={{ width: "36px", height: "1px", background: "linear-gradient(90deg, #3B82F6, transparent)" }} />
          </div>
        )}

        {/* 3D Coverflow Stage */}
        <div
          className="relative w-full h-[520px] flex justify-center items-center mb-8"
          style={{ perspective: "1400px" }}
        >
          {items.map((item, idx) => {
            const offset = (idx - currentIndex + total) % total;

            let transform = "translateX(0px) scale(0.4) rotateY(0deg)";
            let opacity = 0;
            let zIndex = 0;
            let filter = "brightness(0.4) blur(2px)";
            let isCenter = false;

            if (offset === 0) {
              isCenter = true;
              transform = "translateX(0px) scale(1) rotateY(0deg)";
              opacity = 1;
              zIndex = 30;
              filter = "brightness(1)";
            } else if (offset === 1) {
              transform = "translateX(290px) scale(0.84) rotateY(-24deg)";
              opacity = 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === 2) {
              transform = "translateX(520px) scale(0.68) rotateY(-38deg)";
              opacity = 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            } else if (offset === total - 1) {
              transform = "translateX(-290px) scale(0.84) rotateY(24deg)";
              opacity = 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === total - 2) {
              transform = "translateX(-520px) scale(0.68) rotateY(38deg)";
              opacity = 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            }

            return (
              <div
                key={idx}
                onClick={() => {
                  if (!isCenter) {
                    goToSlide(idx);
                  } else {
                    handleAction(item);
                  }
                }}
                style={{
                  position: "absolute",
                  width: "330px",
                  height: "500px",
                  borderRadius: "22px",
                  overflow: "hidden",
                  backgroundColor: "#0d1322",
                  border: isCenter ? "1px solid rgba(59, 130, 246, 0.5)" : "1px solid rgba(255, 255, 255, 0.12)",
                  transform,
                  opacity,
                  zIndex,
                  filter,
                  transformOrigin: "center center",
                  transition: "all 800ms cubic-bezier(0.25, 1, 0.5, 1)",
                  boxShadow: isCenter
                    ? "0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(59,130,246,0.3)"
                    : "0 15px 35px rgba(0,0,0,0.5)",
                  cursor: "pointer",
                }}
              >
                {/* Photo */}
                <img
                  src={item.img}
                  alt={item.titleLine1}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    // Fallback to vibrant abstract placeholder if network fails
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80";
                  }}
                />

                {/* Dark Vignette Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(8,12,22,0.35) 0%, rgba(8,12,22,0.15) 25%, rgba(8,12,22,0.72) 60%, rgba(8,12,22,0.98) 100%)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />

                {/* Content Overlay */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    padding: "22px 20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    textAlign: "center",
                    zIndex: 20,
                    opacity: isCenter ? 1 : 0,
                    transform: isCenter ? "translateY(0px)" : "translateY(16px)",
                    transition: "opacity 500ms ease, transform 500ms ease",
                    pointerEvents: isCenter ? "auto" : "none",
                  }}
                >
                  {/* Tag */}
                  <div style={{ textAlign: "right", width: "100%", paddingRight: "4px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        color: "#60A5FA",
                        textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                        fontFamily: "monospace",
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                        padding: "3px 8px",
                        borderRadius: "9999px",
                        border: "1px solid rgba(59, 130, 246, 0.4)",
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      marginTop: "auto",
                      paddingBottom: "4px",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "1.45rem",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "#ffffff",
                        margin: 0,
                        lineHeight: 1.15,
                        textShadow: "0 3px 12px rgba(0,0,0,0.95)",
                      }}
                    >
                      {item.titleLine1}
                    </h2>

                    {item.titleLine2 && (
                      <span
                        style={{
                          fontSize: "1.02rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#94a3b8",
                          lineHeight: 1.2,
                          textShadow: "0 3px 10px rgba(0,0,0,0.9)",
                          fontFamily: "monospace",
                        }}
                      >
                        {item.titleLine2}
                      </span>
                    )}

                    <div
                      style={{
                        width: "36px",
                        height: "2px",
                        backgroundColor: "#3B82F6",
                        borderRadius: "2px",
                        margin: "6px auto 5px",
                        boxShadow: "0 0 10px rgba(59,130,246,0.8)",
                      }}
                    />

                    {item.desc && (
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(226, 232, 240, 0.95)",
                          maxWidth: "285px",
                          margin: "0 0 12px",
                          lineHeight: 1.35,
                          textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                          fontFamily: "monospace",
                        }}
                      >
                        {item.desc}
                      </p>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(item);
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 20px",
                        borderRadius: "9999px",
                        background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
                        color: "#ffffff",
                        fontSize: "0.74rem",
                        fontWeight: 800,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        border: "none",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.5), 0 0 20px rgba(59,130,246,0.4)",
                        cursor: "pointer",
                        transition: "transform 200ms ease, box-shadow 200ms ease",
                      }}
                    >
                      <span>{item.ctaText || "Launch Engine"}</span>
                      <ArrowRightIcon />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous stage"
          style={{
            position: "absolute",
            left: "24px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "rgba(13,19,34,0.75)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(12px)",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            zIndex: 40,
            transition: "all 200ms ease",
          }}
        >
          <ChevronLeftIcon />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next stage"
          style={{
            position: "absolute",
            right: "24px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "rgba(13,19,34,0.75)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(12px)",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            zIndex: 40,
            transition: "all 200ms ease",
          }}
        >
          <ChevronRightIcon />
        </button>

        {/* Pagination Dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", zIndex: 30 }}>
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to stage ${idx + 1}`}
              style={{
                height: "8px",
                width: idx === currentIndex ? "28px" : "8px",
                borderRadius: "9999px",
                backgroundColor: idx === currentIndex ? "#3B82F6" : "rgba(255,255,255,0.25)",
                border: "none",
                cursor: "pointer",
                boxShadow: idx === currentIndex ? "0 0 12px rgba(59,130,246,0.8)" : "none",
                transition: "all 300ms ease",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export const Component = CoverFlowCarousel;
export { CoverFlowCarousel as ThreeDCoverflowCarousel };
export default CoverFlowCarousel;
