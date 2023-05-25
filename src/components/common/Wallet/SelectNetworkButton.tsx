import classNames from 'classnames'
import { Chain, useNetwork, useSwitchNetwork } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'

import React, { FC, useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickAway } from 'react-use'

import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import { useRpcNodeStore } from '@/store'
import { ChainId } from '@/typings'

const networks = {
  [ChainId.MAINNET]: {
    name: 'BNB Chain',
    network: 'bsc'
  },
  [ChainId.TESTNET]: {
    name: 'BNBTest Chain',
    network: 'bsc-testnet'
  }
}

const SelectNetworkButton: FC = () => {
  const ref = useRef(null)

  const { t } = useTranslation()
  const { chain } = useNetwork()
  const { switchNetwork, isLoading } = useSwitchNetwork()

  const fetchRpc = useRpcNodeStore((state) => state.fetch)

  const [visible, setVisible] = useState<boolean>(false)

  const selectNetwork = useCallback(
    (network: Chain) => {
      if (chain?.id !== network.id) switchNetwork?.(network.id)
      setVisible(false)
    },
    [chain]
  )

  useClickAway(ref, () => {
    setVisible(false)
  })

  useEffect(() => {
    if (chain?.id === ChainId.TESTNET && !isLoading) void fetchRpc(chain?.id)
  }, [chain?.id, isLoading])

  return (
    <div className="web-select-network-button" ref={ref}>
      <Button size="mini" outline loading={isLoading} onClick={() => setVisible(!visible)}>
        {chain?.id === ChainId.TESTNET ? (
          <>
            <Image src="icon/bnb.svg" />
            {isLoading ? 'Network Switching ...' : networks[chain?.id as ChainId]?.name}
          </>
        ) : (
          'Select Network'
        )}
      </Button>
      <div className={classNames('web-select-network-menu', { show: visible })}>
        <h3>{t('Nav.CW.SelectNetwork', 'Select a network')}</h3>
        <ul>
          {[bscTestnet].map((c, index) => (
            <li
              key={index}
              onClick={() => selectNetwork(c)}
              className={classNames({ active: c.network === chain?.network })}
            >
              <Image src="icon/bnb.svg" />
              {networks[c.id as ChainId]?.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default SelectNetworkButton
