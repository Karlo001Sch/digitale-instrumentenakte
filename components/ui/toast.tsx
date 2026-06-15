'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitive.Provider
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn('fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2', className)}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

interface ToastProps {
  title: string
  description?: string
  variant?: 'success' | 'error' | 'warning'
}

export function useToast() {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string; open: boolean })[]>([])

  const toast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...props, id, open: true }])
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, open: false } : t))
    }, 3000)
  }, [])

  return { toast, toasts, setToasts }
}

export function Toaster() {
  const { toast: _toast, toasts, setToasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          open={t.open}
          onOpenChange={(open) => {
            if (!open) setToasts((prev) => prev.filter((x) => x.id !== t.id))
          }}
          className={cn(
            'flex items-start gap-3 rounded-lg border p-4 shadow-lg bg-background',
            t.variant === 'error' && 'border-red-200 bg-red-50',
            t.variant === 'success' && 'border-green-200 bg-green-50',
            t.variant === 'warning' && 'border-yellow-200 bg-yellow-50',
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {t.variant === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
            {t.variant === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
            {t.variant === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <ToastPrimitive.Title className="text-sm font-medium">{t.title}</ToastPrimitive.Title>
            {t.description && (
              <ToastPrimitive.Description className="text-xs text-muted-foreground mt-0.5">
                {t.description}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
