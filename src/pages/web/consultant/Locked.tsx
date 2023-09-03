import { useAtomValue } from 'jotai'
import { useAccount } from 'wagmi'

import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useTranslation } from 'react-i18next'

import { consultantAtom } from '@/atoms/useConsultant'
import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import { PLATFORM_TOKEN } from '@/config/tokens'
import { config } from '@/pages/web/consultant/Lock'
import { calcShortHash, thousandthsDivision } from '@/utils/tools'

const Locked = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const consultant = useAtomValue(consultantAtom)

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
          {consultant?.lockedDays} {t('Consultant.days')}
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
      <Button full disabled>
        {t('Consultant.locked')}
      </Button>
    </section>
  )
}

export default Locked
