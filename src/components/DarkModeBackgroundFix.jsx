'use client'
import { useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

/**
 * DarkModeBackgroundFix
 *
 * Hero.jsx uses position:fixed divs with hardcoded inline background styles
 * that CSS cannot override (inline styles always win over stylesheet rules).
 * This component uses a MutationObserver + direct DOM style patching to:
 * 1. Fix the Hero.jsx fixed background in dark mode → deep dark
 * 2. Fix nav link cards (About/Courses/Services/Contact) in dark mode
 * 3. Restore all patched styles when switching back to light mode
 */
const DarkModeBackgroundFix = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const isPatching = useRef(false)
  const observerRef = useRef(null)

  useEffect(() => {
    // Ensure cleanup runs first
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    const DARK_BG = 'linear-gradient(160deg, #030712 0%, #080d24 45%, #0f0a1e 100%)'
    const LIGHT_BG = 'linear-gradient(160deg,#e6f0ff 0%, #eef2ff 45%, #f3e8ff 100%)'
    const DARK_CARD_BG = 'rgba(10, 18, 40, 0.82)'
    const DARK_CARD_BORDER = 'rgba(99, 102, 241, 0.18)'

    const patchDarkMode = () => {
      if (isPatching.current) return
      isPatching.current = true

      try {
        // 1. Fix Hero.jsx fixed background
        const fixedDivs = document.querySelectorAll(
          'div[style*="position:fixed"], div[style*="position: fixed"]'
        )
        fixedDivs.forEach((div) => {
          const bg = div.style.background || ''
          if (
            (bg.includes('linear-gradient(160deg') || bg.includes('linear-gradient(160deg')) &&
            !bg.includes('#030712') &&
            !bg.includes('rgb(3, 7, 18)')
          ) {
            div.style.background = DARK_BG
          }
        })

        // 2. Fix nav link cards (About, Courses, Services, Contact)
        const hp = document.querySelector('.hp')
        if (hp) {
          // Fix h1 text
          hp.querySelectorAll('[style*="color:#0f172a"], [style*="color: #0f172a"]').forEach((el) => {
            const color = el.style.color || ''
            if (
              color.includes('#0f172a') ||
              color.includes('0f172a') ||
              color.includes('rgb(15, 23, 42)')
            ) {
              el.style.color = '#f1f5f9'
            }
          })

          // Fix grey/muted text
          hp.querySelectorAll('[style*="color:#475569"], [style*="color:#64748b"], [style*="color:#334155"]').forEach((el) => {
            const c = el.style.color || ''
            if (
              c.includes('#475569') || c.includes('475569') || c.includes('rgb(71, 85, 105)') ||
              c.includes('#64748b') || c.includes('64748b') || c.includes('rgb(100, 116, 139)') ||
              c.includes('#334155') || c.includes('334155') || c.includes('rgb(51, 65, 85)')
            ) {
              el.style.color = '#94a3b8'
            }
          })

          // Fix white/light bg cards (both div and a elements)
          hp.querySelectorAll('a[style], div[style]').forEach((el) => {
            const bg = el.style.background || el.style.backgroundColor || ''
            if (
              (bg.includes('rgba(255,255,255') || bg.includes('rgba(255, 255, 255') || bg.includes('rgb(255, 255, 255)')) &&
              !bg.includes('#030712') &&
              !bg.includes('rgb(3, 7, 18)') &&
              !bg.includes('linear-gradient(135deg,#1e3a8a') // preserve trust section
            ) {
              el.style.background = DARK_CARD_BG
              const border = el.style.borderColor || ''
              if (
                border && (
                  border.includes('rgba(255,255,255') ||
                  border.includes('rgba(255, 255, 255') ||
                  border.includes('rgb(255, 255, 255)')
                )
              ) {
                el.style.borderColor = DARK_CARD_BORDER
              }
            }
          })
        }
      } finally {
        // Use setTimeout to prevent re-entrancy issues
        setTimeout(() => { isPatching.current = false }, 50)
      }
    }

    const restoreLightMode = () => {
      // Restore Hero.jsx fixed background
      const fixedDivs = document.querySelectorAll(
        'div[style*="position:fixed"], div[style*="position: fixed"]'
      )
      fixedDivs.forEach((div) => {
        const bg = div.style.background || ''
        if (
          bg.includes('#030712') ||
          bg.includes('rgb(3, 7, 18)') ||
          bg.includes('rgba(3, 7, 18') ||
          bg.includes('030712')
        ) {
          div.style.background = LIGHT_BG
        }
      })

      // Restore .hp inline text and card colors
      const hp = document.querySelector('.hp')
      if (hp) {
        hp.querySelectorAll('*').forEach((el) => {
          // If we set color inline, check if it's white/light slate or rgb equivalent
          const color = el.style.color || ''
          if (
            color.includes('#f1f5f9') ||
            color.includes('rgb(241, 245, 249)') ||
            color.includes('#94a3b8') ||
            color.includes('rgb(148, 163, 184)')
          ) {
            el.style.removeProperty('color')
          }

          // If we set background inline, check if it's the dark card bg
          const bg = el.style.background || el.style.backgroundColor || ''
          if (
            bg.includes('rgba(10, 18, 40') ||
            bg.includes('rgba(10,18,40') ||
            bg.includes('rgb(10, 18, 40)')
          ) {
            el.style.removeProperty('background')
            el.style.removeProperty('background-color')
            el.style.removeProperty('border-color')
          }
        })
      }
    }

    if (isDark) {
      patchDarkMode()

      // Watch for dynamic content
      const observer = new MutationObserver((mutations) => {
        const hasRelevantChange = mutations.some(
          (m) => m.type === 'childList' && m.addedNodes.length > 0
        )
        if (hasRelevantChange) {
          setTimeout(patchDarkMode, 50)
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true })

      observerRef.current = observer

      return () => {
        observer.disconnect()
        observerRef.current = null
      }
    } else {
      restoreLightMode()
    }
  }, [isDark])

  return null
}

export default DarkModeBackgroundFix
