'use client'

import { StoreProvider } from '../src/store/StoreContext'
import { AuthProvider } from '../src/context/AuthContext'
import { ChatProvider } from '../src/context/ChatContext'
import { ThemeProvider } from '../src/context/ThemeContext'

export default function Providers({ children }) {
  return (
          <ThemeProvider>
        <AuthProvider>
          <StoreProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </StoreProvider>
        </AuthProvider>
      </ThemeProvider>
      )
}
