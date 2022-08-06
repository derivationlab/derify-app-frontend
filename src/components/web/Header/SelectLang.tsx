import React, { FC, useState, useRef } from 'react'
import { useClickAway } from 'react-use'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'

import Cache from '@/utils/cache'
import { LANG_CACHE_KEY } from '@/config'
import { languages } from '@/lang'

const SelectLang: FC = () => {
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
        <label>{t('Nav.Tool.Language', 'Language')}</label>
        <span>{languages.find((i) => i.value === i18n.language).label}</span>
      </div>
      <ul className={classNames('web-header-select-lang-menu', { show: menuStatus })}>
        {languages.map(({ label, value }) => {
          return (
            <li
              className={classNames({ active: value === i18n.language })}
              onClick={() => changelang(value)}
              key={value}
            >
              {label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SelectLang
