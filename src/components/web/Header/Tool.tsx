import classNames from 'classnames'

import React, { FC, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickAway } from 'react-use'

import { Docs, Support, Tutorial } from '@/data/links'
import { useMarginTokenStore } from '@/store'

import AddTokenTool from './AddTokenTool'
import Community from './Community'
import SelectLang from './SelectLang'
import SelectTheme from './SelectTheme'

const Tool: FC = () => {
  const ref = useRef(null)

  const { t } = useTranslation()

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const [menuStatus, setMenuStatus] = useState<boolean>(false)

  useClickAway(ref, () => {
    setMenuStatus(false)
  })

  return (
    <div className="web-header-tool" ref={ref}>
      <button
        className={classNames('web-header-tool-button', { active: menuStatus })}
        onClick={() => setMenuStatus(!menuStatus)}
      />
      <div className={classNames('web-header-tool-menu', { show: menuStatus })}>
        <SelectLang />
        <SelectTheme />
        <AddTokenTool />
        <ul>
          <li>
            <a href={Support} target="_blank">
              {t('Nav.Tool.Feedback')}
            </a>
          </li>
          <li>
            <a href={Tutorial} target="_blank">
              {t('Nav.Tool.Tutorial')}
            </a>
          </li>
          <li>
            <a href={Docs} target="_blank">
              {t('Nav.Tool.Docs', 'Docs')}
            </a>
          </li>
          <li>
            <a href={`/${marginToken.symbol}/system/parameters`}>{t('Nav.Tool.SystemParameters')}</a>
          </li>
        </ul>
        <Community />
      </div>
    </div>
  )
}

export default Tool
