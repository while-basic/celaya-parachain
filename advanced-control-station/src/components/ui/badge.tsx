// ----------------------------------------------------------------------------
//  File:        badge.tsx
//  Project:     Celaya Solutions (Advanced Control Station)
//  Created by:  Celaya Solutions, 2025
//  Author:      Christopher Celaya <chris@celayasolutions.com>
//  Description: Badge UI component for status and labels
//  Version:     1.0.0
//  License:     BSL (SPDX id BUSL)
//  Last Update: June 2025
// ----------------------------------------------------------------------------

import * as React from "react"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
    
    const variants = {
      default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80",
      secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
      destructive: "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80",
      outline: "text-slate-950 border-slate-200"
    }
    
    const classes = [
      baseClasses,
      variants[variant],
      className
    ].filter(Boolean).join(" ")
    
    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge } 