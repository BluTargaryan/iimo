'use client'

import { useReportWebVitals } from 'next/web-vitals'

/**
 * Reports Core Web Vitals (LCP, FCP, CLS, FID, INP, TTFB) and Next.js metrics.
 * Hook into analytics by replacing the console.log with sendBeacon or fetch to your endpoint.
 */
export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Log in development; replace with analytics endpoint in production
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric.rating)
    }
    // Example: send to analytics
    // const body = JSON.stringify(metric)
    // const url = '/api/analytics'
    // if (navigator.sendBeacon) navigator.sendBeacon(url, body)
    // else fetch(url, { body, method: 'POST', keepalive: true })
  })
  return null
}
