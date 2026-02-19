import type { ShootWithClient } from '@/app/utils/shootOperations'
import type { UsageRights } from '@/app/utils/usageRightsOperations'

/**
 * Lazy-loaded wrapper for PDF generation
 * This prevents @react-pdf/renderer from being included in the initial bundle
 */
export async function downloadUsageRightsPDF(
  shootData: ShootWithClient,
  usageRights: UsageRights
): Promise<void> {
  const { downloadUsageRightsPDF: downloadPDF } = await import('./UsageRightsPDF')
  return downloadPDF(shootData, usageRights)
}
