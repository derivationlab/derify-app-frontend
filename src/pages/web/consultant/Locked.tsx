import { useAtomValue } from 'jotai'
import { useAccount } from 'wagmi'

import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useTranslation } from 'react-i18next'

import { consultantAtom } from '@/atoms/useConsultant'
import Button from '@/components/common/Button'
import { PLATFORM_TOKEN } from '@/config/tokens'
import { calcShortHash, thousandthsDivision } from '@/utils/tools'

const Locked = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const consultant = useAtomValue(consultantAtom)

  return (
    <section>
      <div className="web-consultant-item">
        <span>{t('Advisor.lockedAmount')}</span>
        <span>
          {thousandthsDivision(consultant?.amount ?? 0)} {PLATFORM_TOKEN.symbol}
        </span>
      </div>
      <div className="web-consultant-item">
        <span>{t('Advisor.lockedDays')}</span>
        <span>
          {consultant?.lockedDays} {t('Advisor.days')}
        </span>
      </div>
      <div className="web-consultant-item">
        <span>{t('Advisor.advisorAddress')}</span>
        <span>
          {calcShortHash(address ?? '', 5, 4)}
          <CopyToClipboard text={address ?? ''} onCopy={() => window.toast.success('Copy successfully')}>
            <em />
          </CopyToClipboard>
        </span>
      </div>
      <Button full disabled>
        {t('Advisor.locked')}
      </Button>
    </section>
  )
}

export default Locked
