import React from 'react'
import { type ShootWithClient } from '@/app/utils/shootOperations'
import { type UsageRights } from '@/app/utils/usageRightsOperations'

interface UsageRightsContentProps {
  shootData: ShootWithClient
  usageRights?: UsageRights
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

const UsageRightsContent = ({ shootData, usageRights }: UsageRightsContentProps) => {
  const clientName = shootData.clients?.name || 'Unknown Client'
  return (
    <div className='col-flex gap-8'>
      <div>
        <h2 className='text-2xl xl:text-3xl font-bold mb-6'>Usage Rights</h2>
      </div>

      {/* Project Details Section */}
      <div className='col-flex gap-4'>
        <h3 className='text-xl xl:text-2xl font-semibold'>Project Details</h3>
        <div className='col-flex gap-2 text-sm xl:text-base'>
          <div className='row-flex gap-2'>
            <span className='font-semibold'>Title:</span>
            <span>{shootData.title}</span>
          </div>
          <div className='row-flex gap-2'>
            <span className='font-semibold'>Client:</span>
            <span>{clientName}</span>
          </div>
          <div className='row-flex gap-2'>
            <span className='font-semibold'>Date Completed:</span>
            <span>{formatDate(shootData.shoot_date)}</span>
          </div>
          <div className='row-flex gap-2'>
            <span className='font-semibold'>Status:</span>
            <span>{shootData.status.charAt(0).toUpperCase() + shootData.status.slice(1)}</span>
          </div>
        </div>
      </div>

      {/* Usage Terms Section */}
      <div className='col-flex gap-4'>
        <h3 className='text-xl xl:text-2xl font-semibold'>Usage Terms</h3>
        <div className='col-flex gap-3 text-sm xl:text-base'>
          {usageRights && (
            <>
              <div className='row-flex gap-2'>
                <span className='font-semibold'>Usage Type:</span>
                <span>{usageRights.usage_type}</span>
              </div>
              {usageRights.start_date && (
                <div className='row-flex gap-2'>
                  <span className='font-semibold'>Start Date:</span>
                  <span>{formatDate(usageRights.start_date)}</span>
                </div>
              )}
              {usageRights.end_date && (
                <div className='row-flex gap-2'>
                  <span className='font-semibold'>End Date:</span>
                  <span className='font-bold'>{formatDate(usageRights.end_date)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Rights and Restrictions Section */}
      <div className='col-flex gap-4'>
        <h3 className='text-xl xl:text-2xl font-semibold'>Rights and Restrictions</h3>
        <div className='col-flex gap-3 text-sm xl:text-base'>
          {usageRights ? (
            <>
              <div>
                <h4 className='font-semibold mb-2'>Usage Type:</h4>
                <p>{usageRights.usage_type}</p>
              </div>
              {usageRights.restrictions && (
                <div>
                  <h4 className='font-semibold mb-2'>Restrictions:</h4>
                  <p className='whitespace-pre-line'>{usageRights.restrictions}</p>
                </div>
              )}
              {usageRights.end_date && (
                <div>
                  <h4 className='font-semibold mb-2'>Expiry:</h4>
                  <p>Usage rights expire on {formatDate(usageRights.end_date)}</p>
                </div>
              )}
              {usageRights.contract && (
                <div>
                  <h4 className='font-semibold mb-2'>Contract:</h4>
                  <a 
                    href={usageRights.contract} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='text-blue-600 underline'
                  >
                    View Contract PDF
                  </a>
                </div>
              )}
            </>
          ) : (
            <div>
              <p>No usage rights defined for this shoot.</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Terms Section */}
      <div className='col-flex gap-4'>
        <h3 className='text-xl xl:text-2xl font-semibold'>Additional Terms</h3>
        <div className='text-sm xl:text-base'>
          <p className='mb-2'>
            All usage rights are subject to the terms and conditions outlined in the original agreement. 
            Any unauthorized use beyond the scope of these rights may result in legal action.
          </p>
          <p>
            For questions regarding usage rights or to request extensions, please contact the 
            original photographer or licensing agent.
          </p>
        </div>
      </div>
    </div>
  )
}

export default UsageRightsContent
