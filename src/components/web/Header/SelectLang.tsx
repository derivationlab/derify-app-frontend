import classNames from 'classnames'

import React, { FC, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickAway } from 'react-use'

import { LANG_CACHE_KEY } from '@/config'
import { languageOptions } from '@/i18n'
import Cache from '@/utils/cache'

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
        <span>{languageOptions.find((i) => i.lng === i18n.language)?.key}</span>
      </div>
      <ul className={classNames('web-header-select-lang-menu', { show: menuStatus })}>
        {languageOptions.map(({ key, lng }) => {
          return (
            <li className={classNames({ active: lng === i18n.language })} onClick={() => changelang(lng)} key={lng}>
              {key}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SelectLang
