/**
 * Telegram Web App SDK wrapper
 * Brauzerda ham ishlaydi (development uchun)
 */

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

interface TelegramWebApp {
  ready(): void
  expand(): void
  close(): void
  isExpanded: boolean
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
    start_param?: string
  }
  initData: string
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    show(): void
    hide(): void
    enable(): void
    disable(): void
    setText(text: string): void
    onClick(cb: () => void): void
    offClick(cb: () => void): void
    showProgress(leaveActive?: boolean): void
    hideProgress(): void
  }
  BackButton: {
    isVisible: boolean
    show(): void
    hide(): void
    onClick(cb: () => void): void
    offClick(cb: () => void): void
  }
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
  setHeaderColor(color: string): void
  setBackgroundColor(color: string): void
}

const twa = window.Telegram?.WebApp

export const TWA = {
  /** SDK mavjudligi */
  isAvailable: !!twa,

  /** Ilovani tayyor deb belgilash */
  ready() {
    twa?.ready()
    twa?.expand()
  },

  /** Joriy foydalanuvchi (Telegram user) */
  get user() {
    return twa?.initDataUnsafe?.user ?? null
  },

  get userId(): number | null {
    return twa?.initDataUnsafe?.user?.id ?? null
  },

  get firstName(): string {
    return twa?.initDataUnsafe?.user?.first_name ?? 'Foydalanuvchi'
  },

  get initData(): string {
    return twa?.initData ?? ''
  },

  /** Rang sxemasi */
  get isDark(): boolean {
    return twa?.colorScheme === 'dark'
  },

  /** Haptik vibrasiya */
  haptic: {
    light: () => twa?.HapticFeedback?.impactOccurred('light'),
    medium: () => twa?.HapticFeedback?.impactOccurred('medium'),
    success: () => twa?.HapticFeedback?.notificationOccurred('success'),
    error: () => twa?.HapticFeedback?.notificationOccurred('error'),
    select: () => twa?.HapticFeedback?.selectionChanged(),
  },

  /** Main Button */
  mainButton: {
    show(text: string, onClick: () => void) {
      if (!twa) return
      twa.MainButton.setText(text)
      twa.MainButton.show()
      twa.MainButton.enable()
      twa.MainButton.onClick(onClick)
    },
    hide() {
      twa?.MainButton.hide()
    },
    loading(show: boolean) {
      if (show) twa?.MainButton.showProgress()
      else twa?.MainButton.hideProgress()
    },
    offClick(cb: () => void) {
      twa?.MainButton.offClick(cb)
    },
  },

  /** Back Button */
  backButton: {
    show(onClick: () => void) {
      if (!twa) return
      twa.BackButton.show()
      twa.BackButton.onClick(onClick)
    },
    hide() {
      twa?.BackButton.hide()
    },
    offClick(cb: () => void) {
      twa?.BackButton.offClick(cb)
    },
  },

  close() {
    twa?.close()
  },
}
