import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/common/Dialog'
import Image from '@/components/common/Image'
import { getWallets, Wallet } from '@/components/common/Wallet/wallets'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (wallet: Wallet) => void
}

const WalletDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()

  const wallets = useMemo(() => getWallets(), [])

  return (
    <Dialog width="472px" visible={visible} title={t('Nav.CW.Title', 'Select a wallet')} onClose={onClose}>
      <div className="web-wallet-dialog">
        <p className="web-wallet-dialog-tips">
          {t('Nav.CW.TitleTip')}{' '}
          <span onClick={() => window.open('https://derify.finance/terms')}>
            {t('Nav.CW.TermsOfService', 'Terms of Service.')}
          </span>
        </p>
        <div className="web-wallet-dialog-list">
          {wallets.map((wallet) => (
            <div className="web-wallet-dialog-list-item" key={wallet.title} onClick={() => onClick(wallet)}>
              <Image src={`icon/${wallet.icon}`} />
              <p>{wallet.title}</p>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  )
}

export default WalletDialog
