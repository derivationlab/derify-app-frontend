import classNames from 'classnames'

import React, { FC, useState, useMemo, useRef, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickAway } from 'react-use'

import { ThemeOptions } from '@/data'
import { ThemeContext } from '@/providers/Theme'

const SelectTheme: FC = () => {
  const { t } = useTranslation()
  const ref = useRef(null)
  const [menuStatus, setMenuStatus] = useState<boolean>(false)
  const { theme, changeTheme } = useContext(ThemeContext)

  const themeDicts = useMemo(() => {
    const arr = [t('Nav.Tool.Light', 'Light'), t('Nav.Tool.Dark', 'Dark')]
    return ThemeOptions.map((item, index) => ({
      value: item,
      label: arr[index]
    }))
  }, [t])

  const currThemeLabel = useMemo(() => {
    const temp = themeDicts.find((item) => item.value.toLocaleLowerCase() === theme.toLocaleLowerCase()) ?? {
      label: ''
    }
    return temp?.label
  }, [themeDicts, theme])

  useClickAway(ref, () => setMenuStatus(false))

  const changeThemeFunc = (value: string) => {
    changeTheme(value)
    setMenuStatus(false)
  }
  return (
    <div className="web-header-select-lang" ref={ref}>
      <div className="web-header-select-lang-label" onClick={() => setMenuStatus(!menuStatus)}>
        <label>{t('Nav.Tool.Theme', 'Theme')}</label>
        <span>{currThemeLabel}</span>
      </div>
      <ul className={classNames('web-header-select-lang-menu', { show: menuStatus })}>
        {themeDicts.map((item: any, index: number) => {
          return (
            <li
              className={classNames({ active: item.value.toLocaleLowerCase() === theme.toLocaleLowerCase() })}
              onClick={() => changeThemeFunc(item.value)}
              key={index}
            >
              {item.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SelectTheme
