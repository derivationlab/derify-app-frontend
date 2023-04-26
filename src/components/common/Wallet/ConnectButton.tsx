import { useTranslation } from 'react-i18next'
import React, { FC, useEffect, useState } from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'

import { Wallet } from '@/components/common/Wallet/wallets'
import { traderInfoUpdates } from '@/api'
import { SharingEvents, useSharingStore, useWalletStore } from '@/store'
import useConnecting from '@/hooks/useConnecting'

import Button from '@/components/common/Button'
import WalletDialog from '@/components/common/Wallet'

interface Props {
  size?: 'mini' | 'default'
}

const ConnectButton: FC<Props> = ({ size = 'mini' }) => {
  const { t } = useTranslation()
  const { chain, chains } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const { isConnected, address } = useAccount()

  const [visibleStatus, setModalStatus] = useState<boolean>(false)
  const [needSwitchNet, setNeedSwitchNet] = useState<boolean>(false)

  const { connectWallet } = useConnecting()

  const sharing = useSharingStore((state) => state.sharing)
  const updateSharing = useSharingStore((state) => state.updateSharing)
  const updateAccount = useWalletStore((state) => state.updateAccount)

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
    if (sharing === SharingEvents.connectWallet) {
      console.info(`sharing:${sharing}`)

      setModalStatus(true)

      updateSharing(undefined)
    }
  }, [sharing])

  useEffect(() => {
    if (isConnected && address) {
      setModalStatus(false)

      updateAccount(address)

      void traderInfoUpdates({ trader: address })
    } else {
      updateAccount('')
    }
  }, [isConnected, address])

  return (
    <>
      {isConnected && address ? (
        <Button className="c-connect-wallet-btn" size={size} to="/space">
          {address.replace(/(\w{5})\w*(\w{4})/, '$1...$2')}
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
