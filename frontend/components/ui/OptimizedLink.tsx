"use client"

import React, { memo, forwardRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface OptimizedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  onMouseEnter?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLAnchorElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLAnchorElement>) => void
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'
  prefetch?: boolean
}

export const OptimizedLink = memo(forwardRef<HTMLAnchorElement, OptimizedLinkProps>(
  ({ href, children, className, style, onClick, onMouseEnter, onMouseLeave, onFocus, onBlur, 'aria-current': ariaCurrent, prefetch = true, ...props }, ref) => {
    const router = useRouter()

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick(e)
      }
    }, [onClick])

    return (
      <Link
        ref={ref}
        href={href}
        className={className}
        style={style}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-current={ariaCurrent}
        prefetch={prefetch}
        {...props}
      >
        {children}
      </Link>
    )
  }
))

OptimizedLink.displayName = 'OptimizedLink'
