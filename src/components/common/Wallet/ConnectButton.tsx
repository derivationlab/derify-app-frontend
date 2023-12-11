import { traderInfoUpdates } from 'derify-apis'
import PubSub from 'pubsub-js'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'

import React, { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import WalletDialog from '@/components/common/Wallet'
import { Wallet } from '@/components/common/Wallet/wallets'
import useConnecting from '@/hooks/useConnecting'
import { useSpaceName } from '@/hooks/useSpaceName'
import { PubSubEvents } from '@/typings'

interface Props {
  size?: 'mini' | 'default'
}

const ConnectButton: FC<Props> = ({ size = 'mini' }) => {
  const { t } = useTranslation()
  const { spaceName } = useSpaceName()
  const { chain, chains } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const { isConnected, address } = useAccount()

  const [visibleStatus, setModalStatus] = useState<boolean>(false)
  const [needSwitchNet, setNeedSwitchNet] = useState<boolean>(false)

  const { connectWallet } = useConnecting()

  const connectWalletFunc = async (wallet: Wallet) => {
    const { installed, connectorId, downloadLink } = wallet
    // console.info(installed)
    // console.info(connectorId)
    // console.info(window.ethereum)
    if (installed === false) return window.open(downloadLink, '_blank')

    const connected = await connectWallet(connectorId)

    if (connected && connected.chain.unsupported) setNeedSwitchNet(true)
  }

  useEffect(() => {
    if ((chain?.unsupported || needSwitchNet) && switchNetwork) switchNetwork(chains[0]?.id)
  }, [chain, needSwitchNet, switchNetwork, chains])

  useEffect(() => {
    PubSub.subscribe(PubSubEvents.CONNECT_WALLET, () => {
      setModalStatus(true)
    })
  }, [])

  useEffect(() => {
    if (isConnected && address) {
      setModalStatus(false)

      void traderInfoUpdates({ trader: address })
    }
  }, [isConnected, address])

  return (
    <>
      {isConnected && address ? (
        <Button className="c-connect-wallet-btn" size={size} to="/space">
          {spaceName ?? address.replace(/(\w{5})\w*(\w{4})/, '$1...$2')}
        </Button>
      ) : (
        <Button className="c-connect-wallet-btn" size={size} onClick={() => setModalStatus(true)}>
          {t('Nav.Nav.ConnectWallet', 'Connect Wallet')}
        </Button>
      )}
      <WalletDialog visible={visibleStatus} onClose={() => setModalStatus(false)} onClick={connectWalletFunc} />
      {/*<AccountDialog visible={visibleStatus === 'account'} onClose={onCloseDialogEv} />*/}
    </>
  )
}

export default ConnectButton
