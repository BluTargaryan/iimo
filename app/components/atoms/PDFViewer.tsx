import React from 'react'

interface PDFViewerProps {
  src?: string
  title?: string
}

const PDFViewer = ({ src, title = 'Usage Document' }: PDFViewerProps) => {
  // Mock PDF URL - replace with actual PDF URL from your backend
  const pdfUrl = src || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'

  return (
    <div className='w-full h-[600px] rounded-lg overflow-hidden bg-foreground'>
      {pdfUrl ? (
        <iframe
          src={`${pdfUrl}#toolbar=1`}
          title={title}
          className='w-full h-full'
          style={{ border: 'none' }}
        />
      ) : (
        <div className='w-full h-full flex-centerize'>
          <span className='text-background text-xl'>PDF not available</span>
        </div>
      )}
    </div>
  )
}

export default PDFViewer

