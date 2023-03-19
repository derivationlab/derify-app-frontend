import classNames from 'classnames'
import { useClickAway } from 'react-use'
import { useTranslation } from 'react-i18next'
import React, { FC, useState, useRef } from 'react'

import { Docs, Support, Tutorial } from '@/data/links'

import Community from './Community'
import SelectLang from './SelectLang'
import SelectTheme from './SelectTheme'
import AddTokenTool from './AddTokenTool'
import { useMarginToken } from '@/zustand'

const Tool: FC = () => {
  const ref = useRef(null)

  const { t } = useTranslation()

  const marginToken = useMarginToken((state) => state.marginToken)

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
            <a href={`/${marginToken}/system/parameters`}>System Parameters</a>
          </li>
        </ul>
        <Community />
      </div>
    </div>
  )
}

export default Tool
