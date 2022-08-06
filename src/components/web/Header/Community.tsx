import React, { FC, useState, useRef } from 'react'
import { useClickAway } from 'react-use'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { Communitys } from '@/data/links'

const Community: FC = () => {
  const { t } = useTranslation()
  const ref = useRef(null)
  const [menuStatus, setMenuStatus] = useState<boolean>(false)
  useClickAway(ref, () => setMenuStatus(false))

  const goLink = (name: string) => {
    // @ts-ignore
    window.open(Communitys[name])
    setMenuStatus(false)
  }
  return (
    <div className="web-header-select-lang" ref={ref}>
      <div className="web-header-select-lang-label" onClick={() => setMenuStatus(!menuStatus)}>
        <label>{t('Nav.Tool.Community', 'Community')}</label>
        <span></span>
      </div>
      <ul className={classNames('web-header-select-lang-menu', { show: menuStatus })}>
        {Object.keys(Communitys).map((name: string) => (
          <li key={name} onClick={() => goLink(name)}>
            {name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Community
