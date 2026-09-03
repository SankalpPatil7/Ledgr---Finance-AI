import React, { Suspense, useEffect, useRef } from 'react';

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className = "" }: SplineSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically import @splinetool/viewer web component if not already defined
    if (typeof window !== "undefined") {
      import("@splinetool/viewer")
        .then(() => {
          // Spline viewer custom element loaded
        })
        .catch((err) => {
          console.warn("Could not import @splinetool/viewer directly, falling back to script tag:", err);
          if (!document.querySelector('script[src*="spline-viewer"]')) {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = 'https://unpkg.com/@splinetool/viewer@1.9.72/build/spline-viewer.js';
            document.head.appendChild(script);
          }
        });
    }
  }, []);

  return (
    <Suspense 
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
        </div>
      }
    >
      <div ref={containerRef} className={`w-full h-full relative overflow-hidden ${className}`}>
        {/* @ts-ignore */}
        <spline-viewer 
          url={scene} 
          loading-anim-type="spinner-small-dark"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </Suspense>
  );
}

export default SplineScene;
