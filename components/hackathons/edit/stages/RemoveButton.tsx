'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { t } from '@/app/events/edit/translations'

type RemoveButtonProps = {
  onRemove: () => void
  tooltipLabel?: string
  confirmPrompt?: string
  size?: number
  className?: string
  language?: 'en' | 'es'
}

/**
 * Minimal remove button component with tooltip
 * Displays an "X" icon that can be used in collapsible items
 * Prevents event propagation to avoid triggering parent click handlers
 */
export default function RemoveButton({
  onRemove,
  tooltipLabel = 'Delete',
  confirmPrompt = 'Confirm delete?',
  language = 'en',
  size = 18,
  className = '',
}: RemoveButtonProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirming) {
      setConfirming(true)
      setOpen(true)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip
        open={open}
        disableHoverableContent={false}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) setConfirming(false)
        }}
      >
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleTriggerClick}
            className={`inline-flex items-center justify-center p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-500 text-zinc-500 dark:text-zinc-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 ${className}`}
            aria-label={tooltipLabel}
          >
            <X size={size} strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="right"
          className="pointer-events-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          {!confirming ? (
            tooltipLabel
          ) : (
            <div className="flex flex-col gap-2">
              <span>{confirmPrompt}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onRemove()
                    setConfirming(false)
                    setOpen(false)
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  className="underline text-xs hover:text-red-400 cursor-pointer"
                >
                  {t[language].confirmAction}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setConfirming(false)
                    setOpen(false)
                  }}
                  className="underline text-xs hover:text-zinc-300 cursor-pointer"
                >
                  {t[language].cancelAction}
                </button>
              </div>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
