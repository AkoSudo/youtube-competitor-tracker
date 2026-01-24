import { onCLS, onFCP, onLCP, onINP, onTTFB, type Metric } from 'web-vitals'

function logMetric(metric: Metric) {
  // Log to console in development
  console.log(`[Web Vitals] ${metric.name}:`, {
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
  })
}

export function reportWebVitals() {
  onCLS(logMetric)   // Cumulative Layout Shift
  onFCP(logMetric)   // First Contentful Paint
  onLCP(logMetric)   // Largest Contentful Paint
  onINP(logMetric)   // Interaction to Next Paint
  onTTFB(logMetric)  // Time to First Byte
}
