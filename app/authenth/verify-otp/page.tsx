import { Suspense } from 'react'
import VerifyOtpForm from './VerifyOtpForm'

function VerifyOtpFallback() {
  return (
    <div className="col-flex items-center max-w-[270px] mx-auto md:max-w-[493px] animate-pulse">
      <div className="w-64 col-flex items-center gap-4 mb-28 text-center md:w-full">
        <div className="h-8 w-32 mx-auto bg-foreground/10 rounded" />
        <div className="h-4 w-full bg-foreground/10 rounded" />
      </div>
      <div className="col-flex gap-6 mb-15 w-full md:gap-7.5">
        <div className="h-12 w-full bg-foreground/10 rounded" />
      </div>
      <div className="w-full col-flex gap-3.5">
        <div className="h-12 w-full bg-foreground/10 rounded" />
        <div className="h-12 w-full bg-foreground/10 rounded" />
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<VerifyOtpFallback />}>
      <VerifyOtpForm />
    </Suspense>
  )
}
