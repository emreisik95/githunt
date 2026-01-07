import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from 'react'
import { X, Check, Warning, Info } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeToast(id)
    }, 3000)
  }, [removeToast])

  const value: ToastContextValue = {
    toast: addToast,
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    warning: (message) => addToast(message, 'warning'),
    info: (message) => addToast(message, 'info'),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: () => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])

  const icons: Record<ToastType, typeof Check> = {
    success: Check,
    error: X,
    warning: Warning,
    info: Info,
  }

  const Icon = icons[toast.type]

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 shadow-lg',
        'transform transition-all duration-200',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full',
          toast.type === 'success' && 'bg-accent/20 text-accent',
          toast.type === 'error' && 'bg-red-500/20 text-red-500',
          toast.type === 'warning' && 'bg-yellow-500/20 text-yellow-500',
          toast.type === 'info' && 'bg-blue-500/20 text-blue-500'
        )}
      >
        <Icon size={12} weight="bold" />
      </span>
      <span className="text-sm text-foreground">{toast.message}</span>
      <button
        onClick={onRemove}
        className="ml-2 text-muted hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}
