import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/common/Dialog'
import Image from '@/components/common/Image'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (index: number) => void
}

export const wallets = [
  {
    title: 'MetaMask',
    icon: 'metamask.svg',
    id: 3
  },
  {
    title: 'Coinbase Wallet',
    icon: 'coinbase.svg',
    id: 1
  },
  {
    title: 'WalletConnect',
    icon: 'wallet-connect.svg',
    id: 2
  },
  {
    title: 'Injected',
    hidden: true,
    icon: 'metamask.svg',
    id: 3
  }
]

const WalletDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
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
          {wallets
            .filter((w) => !w.hidden)
            .map((w, index) => (
              <div className="web-wallet-dialog-list-item" key={w.title} onClick={() => onClick(w.id)}>
                <Image src={`icon/${w.icon}`} />
                <p>{w.title}</p>
              </div>
            ))}
        </div>
      </div>
    </Dialog>
  )
}

WalletDialog.defaultProps = {}

export default WalletDialog
