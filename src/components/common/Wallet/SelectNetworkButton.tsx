import classNames from 'classnames'
import { useClickAway } from 'react-use'
import { useTranslation } from 'react-i18next'
import React, { FC, useState, useRef } from 'react'

import Image from '@/components/common/Image'
import Button from '@/components/common/Button'

const networks: Record<string, any>[] = [
  {
    icon: 'icon/bnb.svg',
    name: 'BNB Chain',
    shortName: 'BNB Chain'
    // id: '97'
    // },
    // {
    //   icon: 'icon/bnb.svg',
    //   name: 'Polygon',
    //   shortName: 'POL',
    //   id: '97'
    // },
    // {
    //   icon: 'icon/bnb.svg',
    //   name: 'Avalanche',
    //   shortName: 'AVA',
    //   id: '97'
    // },
    // {
    //   icon: 'icon/etherum.svg',
    //   name: 'Etherum',
    //   shortName: 'ETH',
    //   id: '97'
  }
]

const SelectNetworkButton: FC = () => {
  const ref = useRef(null)

  const { t } = useTranslation()

  const [menuStatus, setMenuStatus] = useState<boolean>(false)
  const [curr, setCurr] = useState<Record<string, any>>(networks[0])

  const selectNetwork = (item: Record<string, any>) => {
    setCurr(item)
    setMenuStatus(false)
  }

  useClickAway(ref, () => {
    setMenuStatus(false)
  })

  return (
    <div className="web-select-network-button" ref={ref}>
      <Button size="mini" outline onClick={() => setMenuStatus(!menuStatus)}>
        <Image src={curr.icon} />
        {curr.shortName}
      </Button>
      <div className={classNames('web-select-network-menu', { show: menuStatus })}>
        <h3>{t('Nav.CW.SelectNetwork', 'Select a network')}</h3>
        <ul>
          {networks.map((item, index) => (
            <li
              key={index}
              onClick={() => selectNetwork(item)}
              className={classNames({ active: item.name === curr.name })}
            >
              <Image src={item.icon} />
              {item.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default SelectNetworkButton
