'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect, useState } from 'react'

export function PHProvider({ children }) {
  const [posthogClient, setPosthogClient] = useState(null)

  useEffect(() => {
    // Only initialize on the client
    if (typeof window === 'undefined') return

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (!posthogKey) {
      console.warn('PostHog key not found in environment variables')
      return
    }

    // Check if PostHog is already initialized
    if (posthog.__loaded) {
      setPosthogClient(posthog)
      return
    }

    // Initialize PostHog
    const consent = localStorage.getItem('cookie_consent')
    
    try {
      posthog.init(posthogKey, {
        api_host: posthogHost || 'https://app.posthog.com',
        persistence: consent === 'yes' ? 'localStorage+cookie' : 'memory',
        enable_heatmaps: true,
        loaded_feature_flags: true, // Enable feature flags
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
      })

      console.log('PostHog initialized:', {
        api_host: posthogHost || 'https://app.posthog.com',
        hasKey: !!posthogKey
      })

      // Detect if requests are being blocked
      setTimeout(() => {
        if (posthog.__loaded) {
          // Check if feature flags are available
          try {
            const testFlag = posthog.isFeatureEnabled('test-flag-that-does-not-exist');
            // If no error, PostHog is working
          } catch (error) {
            console.warn('[PostHog] Feature flags may be blocked by ad blocker. Using env fallback.')
          }
        }
      }, 2000)

      setPosthogClient(posthog)
    } catch (error) {
      console.error('Error initializing PostHog:', error)
    }
  }, [])

  // If there's no PostHog client, render children without provider
  if (!posthogClient) {
    return children
  }

  return <PostHogProvider client={posthogClient}>{children}</PostHogProvider>
}