import classNames from 'classnames'

import React, { FC, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickAway } from 'react-use'

import { DerifyV1 } from '@/config'

const Versions: FC = () => {
  const ref = useRef(null)
  const { t } = useTranslation()

  const [menuStatus, setMenuStatus] = useState<boolean>(false)

  useClickAway(ref, () => setMenuStatus(false))

  return (
    <div className="web-header-select-lang" ref={ref}>
      <div className="web-header-select-lang-label" onClick={() => setMenuStatus(!menuStatus)}>
        <label>{t('Nav.Tool.OldVersions')}</label>
        <span />
      </div>
      <ul className={classNames('web-header-select-lang-menu', { show: menuStatus })}>
        <li className="px-0">
          <a href={DerifyV1} target="_blank">
            Version 1.0
          </a>
        </li>
      </ul>
    </div>
  )
}

export default Versions
