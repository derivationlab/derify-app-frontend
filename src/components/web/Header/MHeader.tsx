import React, { FC, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import ConnectButton from '@/components/common/Wallet/ConnectButton'
import SelectNetworkButton from '@/components/common/Wallet/SelectNetworkButton'
import { useMarginTokenStore } from '@/store'

import MNav from './MNav'
import Tool from './Tool'

const MHeader: FC = () => {
  const { t } = useTranslation()
  const { pathname: P } = useLocation()

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const navList = [
    { url: `/${marginToken.symbol}/trade`, name: t('Nav.Nav.Trade', 'Trade') },
    { url: `/${marginToken.symbol}/earn`, name: t('Nav.Nav.Earn', 'Earn') },
    { url: `/${marginToken.symbol}/data`, name: t('Nav.Nav.Data', 'Data') },
    { url: `/broker`, name: t('Nav.Nav.Broker', 'Broker') }
    // { url: `/${marginToken.symbol}/dashboard`, name: t('Nav.Nav.Dashboard', 'Dashboard') }
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
