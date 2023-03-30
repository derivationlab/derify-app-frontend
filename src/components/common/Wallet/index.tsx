import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useConnect } from 'wagmi'

import Dialog from '@/components/common/Dialog'
import Image from '@/components/common/Image'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (index: number) => void
}

// "metaMask"
// "coinbaseWallet"
// "walletConnect"
// "injected"

const WalletDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { connectors } = useConnect()

  const wallets = useMemo(() => {
    const ids = connectors.filter((c) => c.ready).map((c) => c.id)

    const isMetaMaskReady = ids.includes('metaMask')

    return [
      {
        title: 'MetaMask',
        icon: 'metamask.svg',
        id: 0
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
      }
    ]
  }, [connectors])

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
          {wallets.map((w, index) => (
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
