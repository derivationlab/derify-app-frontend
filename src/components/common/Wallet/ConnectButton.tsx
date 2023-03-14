import { useTranslation } from 'react-i18next'
import { useAccount, useConnect, useNetwork, useSwitchNetwork } from 'wagmi'
import React, { FC, useEffect, useState, useMemo, useCallback } from 'react'

import { traderInfoUpdates } from '@/api'

import Button from '@/components/common/Button'
import WalletDialog from '@/components/common/Wallet'
import AccountDialog from '@/components/common/Wallet/Account'

interface Props {
  size?: 'mini' | 'default'
}

const ConnectButton: FC<Props> = ({ size = 'mini' }) => {
  const { t } = useTranslation()
  const { chain, chains } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const { connectAsync, connectors, isLoading } = useConnect()
  const { connector: activeConnector, isConnected, address } = useAccount()

  const [needSwitchNet, setNeedSwitchNet] = useState<boolean>(false)
  const [showWalletInf, setShowWalletInf] = useState<boolean>(false)
  const [visibleStatus, setVisibleStatus] = useState<string>('')

  const todoWalletLogin = async (connectorsIndex: number) => {
    const connector = connectors[connectorsIndex]

    if (connector === undefined) {
      window.toast.error('Wallet Connector is undefined. Please refresh and try again.')
      return
    }

    if (!connector.ready && connectorsIndex === 0) {
      window.open('https://metamask.io/download/', '_blank')
      return
    }

    const connectRes = await connectAsync({ connector })

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
    if (address) return address.replace(/(\w{5})\w*(\w{4})/, '$1...$2')
    return ''
  }, [address])

  const onClickWalletCb = useCallback(() => {
    if (address) {
      setShowWalletInf(!showWalletInf)
    } else {
      setVisibleStatus('connect')
    }
  }, [address, showWalletInf])

  const onCloseDialogEv = () => setVisibleStatus('')

  useEffect(() => {
    if (!isLoading && activeConnector && address) setVisibleStatus('')
  }, [address, isLoading, activeConnector])

  useEffect(() => {
    if (!activeConnector) setShowWalletInf(false)
  }, [activeConnector])

  useEffect(() => {
    if ((chain?.unsupported || needSwitchNet) && switchNetwork) switchNetwork(chains[0]?.id)
  }, [chain, needSwitchNet, switchNetwork, chains])

  useEffect(() => {
    const func = (trader: string) => {
      void traderInfoUpdates({ trader })
    }

    if (isConnected && address) {
      func(address)
    }
  }, [isConnected, address])

  return (
    <>
      {isConnected && address ? (
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
