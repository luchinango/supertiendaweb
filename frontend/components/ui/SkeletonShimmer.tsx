import React from "react"

interface SkeletonShimmerProps {
  className?: string
}

export function SkeletonShimmer({className = ""}: SkeletonShimmerProps) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-gray-300 ${className}`}>
      <div
        className="absolute inset-0 w-full h-full transform-gpu animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"
        style={{width: '200%', transform: 'translateX(-100%)'}}
      />
    </div>
  );
}
