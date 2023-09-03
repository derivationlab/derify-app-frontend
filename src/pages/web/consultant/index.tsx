import { useAtomValue, useSetAtom } from 'jotai'
import { useAccount } from 'wagmi'

import React, { useEffect, useMemo } from 'react'

import { asyncConsultantAtom, consultantAtom } from '@/atoms/useConsultant'
import Spinner from '@/components/common/Spinner'
import IsItConnected from '@/components/web/IsItConnected'
import Claim from '@/pages/web/consultant/Claim'
import Lock, { config } from '@/pages/web/consultant/Lock'
import Locked from '@/pages/web/consultant/Locked'

const ConsultantInner = () => {
  const { address } = useAccount()
  const consultant = useAtomValue(consultantAtom)
  const asyncConsultant = useSetAtom(asyncConsultantAtom(address))

  const content = useMemo(() => {
    if (!consultant) return <Spinner small />
    if (consultant.vestingDuration === 0) return <Lock />
    if (consultant.vestingDuration > 0) return <Locked />
    if (consultant.lockedDays > config.period) return <Claim />
    return null
  }, [consultant])

  useEffect(() => {
    if (address) void asyncConsultant()
  }, [address])

  return (
    <section className="web-consultant">
      <section className="web-consultant-inner">{content}</section>
    </section>
  )
}

const Consultant = () => {
  return (
    <IsItConnected>
      <ConsultantInner />
    </IsItConnected>
  )
}

export default Consultant
