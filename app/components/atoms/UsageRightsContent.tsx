import React from 'react'

interface UsageRightsContentProps {
  shootData: {
    title: string
    client: string
    doneDate: string
    deliveredDate: string
    expiryDate: string
    description: string
  }
}

const UsageRightsContent = ({ shootData }: UsageRightsContentProps) => {
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
            <span>{shootData.client}</span>
          </div>
          <div className='row-flex gap-2'>
            <span className='font-semibold'>Date Completed:</span>
            <span>{shootData.doneDate}</span>
          </div>
          <div className='row-flex gap-2'>
            <span className='font-semibold'>Delivered:</span>
            <span>{shootData.deliveredDate}</span>
          </div>
        </div>
      </div>

      {/* Usage Terms Section */}
      <div className='col-flex gap-4'>
        <h3 className='text-xl xl:text-2xl font-semibold'>Usage Terms</h3>
        <div className='col-flex gap-3 text-sm xl:text-base'>
          <div className='row-flex gap-2'>
            <span className='font-semibold'>Expiry Date:</span>
            <span className='font-bold'>{shootData.expiryDate}</span>
          </div>
          <div className='col-flex gap-2'>
            <span className='font-semibold'>Description:</span>
            <p className='font-normal'>{shootData.description}</p>
          </div>
        </div>
      </div>

      {/* Rights and Restrictions Section */}
      <div className='col-flex gap-4'>
        <h3 className='text-xl xl:text-2xl font-semibold'>Rights and Restrictions</h3>
        <div className='col-flex gap-3 text-sm xl:text-base'>
          <div>
            <h4 className='font-semibold mb-2'>Granted Rights:</h4>
            <ul className='list-disc list-inside col-flex gap-1 ml-4'>
              <li>Right to use images for marketing and promotional purposes</li>
              <li>Right to display images on digital platforms and websites</li>
              <li>Right to use images in print materials</li>
            </ul>
          </div>
          <div>
            <h4 className='font-semibold mb-2'>Restrictions:</h4>
            <ul className='list-disc list-inside col-flex gap-1 ml-4'>
              <li>Images may not be resold or redistributed without permission</li>
              <li>Images may not be used for defamatory or illegal purposes</li>
              <li>Usage rights expire on {shootData.expiryDate}</li>
            </ul>
          </div>
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
