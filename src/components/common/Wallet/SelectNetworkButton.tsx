import classNames from 'classnames'

import React, { FC, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickAway } from 'react-use'

import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
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

  const [visible, setVisible] = useState<boolean>(false)

  useClickAway(ref, () => {
    setVisible(false)
  })

  return (
    <div className="web-select-network-button" ref={ref}>
      <Button size="mini" outline onClick={() => setVisible(!visible)}>
        <Image src="icon/bnb.svg" />
        {networks[ChainId.TESTNET].name}
      </Button>
      <div className={classNames('web-select-network-menu', { show: visible })}>
        <h3>{t('Nav.CW.SelectNetwork', 'Select a network')}</h3>
        <ul>
          <li className='active'>
            <Image src="icon/bnb.svg" />
            {networks[ChainId.TESTNET].name}
          </li>
          <li onClick={() => window.open('https://prebnb.derify.exchange/')}>
            <Image src="icon/bnb.svg" />
            {networks[ChainId.MAINNET].name}
          </li>
        </ul>
      </div>
    </div>
  )
}

export default SelectNetworkButton
