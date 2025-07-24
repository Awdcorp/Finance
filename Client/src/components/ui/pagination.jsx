import * as React from "react"
import { cn } from "@/lib/utils"

export function Pagination({ children, className, ...props }) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </nav>
  )
}

export function PaginationContent({ className, ...props }) {
  return <div className={cn("flex items-center gap-4", className)} {...props} />
}

export function PaginationItem({ className, ...props }) {
  return <div className={cn("", className)} {...props} />
}

export function PaginationPrevious({ className, ...props }) {
  return (
    <button
      type="button"
      aria-label="Go to previous page"
      className={cn("text-sm px-3 py-1 border rounded-md", className)}
      {...props}
    >
      Previous
    </button>
  )
}

export function PaginationNext({ className, ...props }) {
  return (
    <button
      type="button"
      aria-label="Go to next page"
      className={cn("text-sm px-3 py-1 border rounded-md", className)}
      {...props}
    >
      Next
    </button>
  )
}
