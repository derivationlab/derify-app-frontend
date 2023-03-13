import React, { FC, useState, useRef } from 'react'
import { useClickAway } from 'react-use'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'

import Cache from '@/utils/cache'
import { LANG_CACHE_KEY } from '@/config'
import { languages } from '@/lang'

const AddTokenTool: FC = () => {
  const { t } = useTranslation()
  const ref = useRef(null)
  const [menuStatus, setMenuStatus] = useState<boolean>(false)
  useClickAway(ref, () => setMenuStatus(false))

  const { i18n } = useTranslation()
  const changelang = (code: string): void => {
    i18n.changeLanguage(code).catch(() => null)
    Cache.set(LANG_CACHE_KEY, code)
    setMenuStatus(false)
  }
  return (
    <div className="web-header-select-lang" ref={ref}>
      <div className="web-header-select-lang-label" onClick={() => setMenuStatus(!menuStatus)}>
        <label>Token</label>
        <span></span>
      </div>
      <ul className={classNames('web-header-select-lang-menu', { show: menuStatus })}>
        <li>Add eDRF to Wallet</li>
        <li>Add DRF to Wallet</li>
        <li>Add bCAKE to Wallet</li>
        <hr />
        <li>Buy DRF at PancakeSwap</li>
      </ul>
    </div>
  )
}

export default AddTokenTool
