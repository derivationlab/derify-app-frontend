import React, { FC, useEffect, useState, useMemo, useCallback } from 'react'
import { useAccount, useConnect, useNetwork } from 'wagmi'
import { useTranslation } from 'react-i18next'

import { traderInfoUpdates } from '@/api'

import Button from '@/components/common/Button'
import WalletDialog from '@/components/common/Wallet'
import AccountDialog from '@/components/common/Wallet/Account'

interface Props {
  size?: 'mini' | 'default'
}

const ConnectButton: FC<Props> = ({ size = 'mini' }) => {
  const { t } = useTranslation()
  const { data: account } = useAccount()
  const { activeChain, switchNetwork, chains } = useNetwork()
  const { connectAsync, connectors, isConnecting, activeConnector, isConnected } = useConnect()

  const [needSwitchNet, setNeedSwitchNet] = useState<boolean>(false)
  const [showWalletInf, setShowWalletInf] = useState<boolean>(false)
  const [visibleStatus, setVisibleStatus] = useState<string>('')

  const todoWalletLogin = async (connectorsIndex: number) => {
    const connector = connectors[connectorsIndex]

    if (connector === undefined) {
      window.toast.error('Wallet Connector is undefined. Please refresh and try again.')
      return
    }

    if (!connector.ready && [0, 3].includes(connectorsIndex)) {
      window.open('https://metamask.io/download/', '_blank')
      return
    }

    const connectRes = await connectAsync(connector)

    if (!connectRes) {
      window.toast.error('Wallet Connector could not connect. Please refresh and try again.')
      return
    }

    if (connectRes.chain.unsupported) {
      setNeedSwitchNet(true)
      return
    }
  }

  const memoAccountHide = useMemo(() => {
    const _account = account?.address
    if (_account) return _account.replace(/(\w{5})\w*(\w{4})/, '$1...$2')
    return ''
  }, [account?.address])

  const onClickWalletCb = useCallback(() => {
    if (account?.address) {
      setShowWalletInf(!showWalletInf)
    } else {
      setVisibleStatus('connect')
    }
  }, [account?.address, showWalletInf])

  const onCloseDialogEv = () => setVisibleStatus('')

  useEffect(() => {
    if (!isConnecting && activeConnector && account?.address) setVisibleStatus('')
  }, [account?.address, isConnecting, activeConnector])

  useEffect(() => {
    if (!activeConnector) setShowWalletInf(false)
  }, [activeConnector])

  useEffect(() => {
    if ((activeChain?.unsupported || needSwitchNet) && switchNetwork) switchNetwork(chains[0]?.id)
  }, [activeChain, needSwitchNet, switchNetwork, chains])

  useEffect(() => {
    const func = (trader: string) => {
      void traderInfoUpdates({ trader })
    }

    if (isConnected && account?.address) {
      func(account.address)
    }
  }, [isConnected, account?.address])

  // onClick={() => setVisibleStatus('account')}
  return (
    <>
      {isConnected && account?.address ? (
        <Button className="c-connect-wallet-btn" size={size} to="/my-space">
          {memoAccountHide}
        </Button>
      ) : (
        <Button className="c-connect-wallet-btn" size={size} onClick={onClickWalletCb}>
          {t('Nav.Nav.ConnectWallet', 'Connect Wallet')}
        </Button>
      )}
      <WalletDialog visible={visibleStatus === 'connect'} onClose={onCloseDialogEv} onClick={todoWalletLogin} />
      <AccountDialog visible={visibleStatus === 'account'} onClose={onCloseDialogEv} />
    </>
  )
}

export default ConnectButton
