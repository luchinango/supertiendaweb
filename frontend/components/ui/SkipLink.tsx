"use client"

import React, { memo } from 'react'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export const SkipLink = memo(({ href, children, className = "" }: SkipLinkProps) => {
  return (
    <a
      href={href}
      className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-white ${className}`}
    >
      {children}
    </a>
  )
})

SkipLink.displayName = 'SkipLink'
