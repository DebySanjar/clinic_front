/**
 * iOS-style drum/scroll picker for time selection
 */
import { useRef, useEffect, useState, useCallback } from 'react'
import { cn } from '@/utils'

const ITEM_H = 40

interface DrumColumnProps {
  items: string[]
  selected: string
  onChange: (val: string) => void
  label?: string
}

function DrumColumn({ items, selected, onChange, label }: DrumColumnProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const selectedIdx = items.indexOf(selected)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startScroll = useRef(0)

  // Scroll to selected on mount / change
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = selectedIdx * ITEM_H
  }, [selectedIdx])

  const snapToNearest = useCallback(() => {
    const el = listRef.current
    if (!el) return
    const idx = Math.round(el.scrollTop / ITEM_H)
    const clamped = Math.max(0, Math.min(idx, items.length - 1))
    el.scrollTop = clamped * ITEM_H
    onChange(items[clamped])
  }, [items, onChange])

  const onScroll = () => {
    const el = listRef.current
    if (!el || isDragging.current) return
    clearTimeout((el as any)._snapTimer)
    ;(el as any)._snapTimer = setTimeout(snapToNearest, 80)
  }

  // Touch / mouse drag
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    startY.current = e.clientY
    startScroll.current = listRef.current!.scrollTop
    listRef.current!.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const delta = startY.current - e.clientY
    listRef.current!.scrollTop = startScroll.current + delta
  }
  const onPointerUp = () => {
    isDragging.current = false
    snapToNearest()
  }

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      {label && <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>}
      <div className="relative w-16 overflow-hidden rounded-xl bg-gray-50 border border-gray-100"
        style={{ height: ITEM_H * 5 }}>

        {/* Selection highlight */}
        <div className="absolute left-0 right-0 pointer-events-none z-10"
          style={{ top: ITEM_H * 2, height: ITEM_H }}>
          <div className="h-full mx-1 rounded-xl bg-primary-600/10 border border-primary-500/30" />
        </div>

        {/* Top fade */}
        <div className="absolute inset-x-0 top-0 h-16 pointer-events-none z-10
                        bg-gradient-to-b from-white/90 to-transparent" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none z-10
                        bg-gradient-to-t from-white/90 to-transparent" />

        {/* Scrollable list */}
        <div
          ref={listRef}
          className="absolute inset-0 overflow-y-scroll"
          style={{ scrollbarWidth: 'none', paddingTop: ITEM_H * 2, paddingBottom: ITEM_H * 2 }}
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* spacer top */}
          <div style={{ height: 0 }} />
          {items.map((item) => (
            <div key={item}
              className={cn(
                'flex items-center justify-center cursor-pointer transition-all duration-150',
                'text-base font-semibold',
                item === selected ? 'text-primary-700 scale-105' : 'text-gray-400'
              )}
              style={{ height: ITEM_H }}
              onClick={() => {
                onChange(item)
                if (listRef.current) {
                  listRef.current.scrollTop = items.indexOf(item) * ITEM_H
                }
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── TimePickerDrum ───────────────────────────────────────────────────────────

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']

interface TimePickerDrumProps {
  value: string        // "HH:MM"
  onChange: (v: string) => void
  label?: string
}

export function TimePickerDrum({ value, onChange, label }: TimePickerDrumProps) {
  const [h, m] = (value || '09:00').split(':')
  const hour   = HOURS.includes(h) ? h : '09'
  const minute = MINUTES.includes(m) ? m : '00'

  const setHour   = (v: string) => onChange(`${v}:${minute}`)
  const setMinute = (v: string) => onChange(`${hour}:${v}`)

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-xs font-semibold text-gray-600">{label}</span>}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-3 w-fit">
        <DrumColumn items={HOURS}   selected={hour}   onChange={setHour}   label="Soat" />
        <span className="text-2xl font-bold text-gray-300 pb-1 mt-4">:</span>
        <DrumColumn items={MINUTES} selected={minute} onChange={setMinute} label="Daq" />
      </div>
      <p className="text-xs text-gray-400">Tanlangan: <span className="font-bold text-primary-600">{hour}:{minute}</span></p>
    </div>
  )
}
