"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface VirtualizedListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T, index: number) => string | number
  overscan?: number
  className?: string
}

export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  keyExtractor,
  overscan = 5,
  className = ""
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight)
    const visibleCount = Math.ceil(height / itemHeight)
    const end = Math.min(start + visibleCount + overscan, items.length)
    const startIndex = Math.max(0, start - overscan)

    return { start: startIndex, end }
  }, [scrollTop, itemHeight, height, items.length, overscan])

  const offsetY = useMemo(() => {
    return visibleRange.start * itemHeight
  }, [visibleRange.start, itemHeight])

  const bottomPadding = useMemo(() => {
    return (items.length - visibleRange.end) * itemHeight
  }, [items.length, visibleRange.end, itemHeight])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end)
  }, [items, visibleRange.start, visibleRange.end])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const scrollToItem = useCallback((index: number) => {
    if (containerRef.current) {
      const targetScrollTop = index * itemHeight
      containerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      })
    }
  }, [itemHeight])

  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ paddingTop: offsetY, paddingBottom: bottomPadding }}>
        {visibleItems.map((item, index) => (
          <div
            key={keyExtractor(item, visibleRange.start + index)}
            style={{ height: itemHeight }}
          >
            {renderItem(item, visibleRange.start + index)}
          </div>
        ))}
      </div>
    </div>
  )
}

export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(start + visibleCount + overscan, items.length)
    const startIndex = Math.max(0, start - overscan)

    return { start: startIndex, end }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const offsetY = useMemo(() => {
    return visibleRange.start * itemHeight
  }, [visibleRange.start, itemHeight])

  const bottomPadding = useMemo(() => {
    return (items.length - visibleRange.end) * itemHeight
  }, [items.length, visibleRange.end, itemHeight])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end)
  }, [items, visibleRange.start, visibleRange.end])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    offsetY,
    bottomPadding,
    handleScroll,
    visibleRange
  }
}
