import { useAtomValue, useSetAtom } from 'jotai'
import { useAccount, useSigner } from 'wagmi'

import { useCallback, useMemo } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import { asyncConsultantAtom, consultantAtom } from '@/atoms/useConsultant'
import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import { PLATFORM_TOKEN } from '@/config/tokens'
import { useConsultant } from '@/hooks/useConsultant'
import { config } from '@/pages/web/consultant/Lock'
import { calcShortHash, isLTET, thousandthsDivision } from '@/utils/tools'

const Claim = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const { claimInsurance } = useConsultant()
  const [isLoading, setLoading] = useBoolean(false)
  const consultant = useAtomValue(consultantAtom)
  const asyncConsultant = useSetAtom(asyncConsultantAtom(address))

  const disabled = useMemo(() => {
    return !signer || isLTET(consultant?.lockedDays ?? 0, config.period)
  }, [signer, consultant])

  const _claimInsurance = useCallback(async () => {
    setLoading(true)
    const toast = window.toast.loading(t('common.pending'))
    const status = await claimInsurance(signer)
    if (status) {
      window.toast.success(t('common.success'))
      void (await asyncConsultant())
    } else {
      window.toast.error(t('common.failed'))
    }
    setLoading(false)
    window.toast.dismiss(toast)
  }, [signer])

  return (
    <section>
      <div className="web-consultant-item">
        <span>{t('Consultant.lockedAmount')}</span>
        <span>
          {thousandthsDivision(config.amount)} {PLATFORM_TOKEN.symbol}
        </span>
      </div>
      <div className="web-consultant-item">
        <span>{t('Consultant.lockedDays')}</span>
        <span>
          {consultant?.lockedDays ?? 0} {t('Consultant.days')}
        </span>
      </div>
      <div className="web-consultant-item">
        <span>{t('Consultant.advisorAddress')}</span>
        <span>
          {calcShortHash(address ?? '', 5, 4)}
          <CopyToClipboard text={address ?? ''} onCopy={() => window.toast.success('Copy successfully')}>
            <Image src="icon/copy.svg" />
          </CopyToClipboard>
        </span>
      </div>
      <Button full disabled={disabled} loading={isLoading} onClick={_claimInsurance}>
        {t('Consultant.claim')}
      </Button>
    </section>
  )
}

export default Claim
