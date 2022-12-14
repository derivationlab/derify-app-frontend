import React, { FC, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import ConnectButton from '@/components/common/Wallet/ConnectButton'
import SelectNetworkButton from '@/components/common/Wallet/SelectNetworkButton'

import Tool from './Tool'
import MNav from './MNav'

const MHeader: FC = () => {
  const { t } = useTranslation()
  const { pathname: P } = useLocation()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const navList = [
    { url: '/trade', name: t('Nav.Nav.Trade', 'Trade') },
    { url: '/earn', name: t('Nav.Nav.Earn', 'Earn') },
    { url: '/dashboard', name: t('Nav.Nav.Dashboard', 'Dashboard') },
    { url: '/broker', name: t('Nav.Nav.Broker', 'Broker') },
    { url: '/faucet', name: t('Nav.Nav.Faucet', 'Faucet') }
  ]

  const [showMenu, setShowMenu] = useState<boolean>(false)
  const [currNav, setCurrNav] = useState<string>(navList[0].name)

  useEffect(() => {
    navList.forEach((item) => {
      if (P.includes(item.url)) setCurrNav(item.name)
    })
  }, [P, navList])

  return (
    <>
      <header className="m-header">
        <h1 className="m-logo" onClick={() => setShowMenu(true)}>
          {currNav}
        </h1>
        <div className="m-header-right">
          <ConnectButton />
          <SelectNetworkButton />
          <Tool />
        </div>
      </header>
      <div className="m-header-bg" />
      <div className="m-header-blank" />
      <MNav show={showMenu} list={navList} onClose={() => setShowMenu(false)} />
    </>
  )
}

export default MHeader
