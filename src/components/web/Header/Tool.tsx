import React, { FC, useState, useRef } from 'react'
import { useClickAway } from 'react-use'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import SelectLang from './SelectLang'
import SelectTheme from './SelectTheme'
import Community from './Community'
import AddTokenTool from './AddTokenTool'

import { Feedback, Docs, WhitePaper, Tutorial, TestNet } from '@/data/links'

const Tool: FC = () => {
  const { t } = useTranslation()
  const ref = useRef(null)
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
          {/*
          <li>
            <a href={Feedback} target="_blank">
              {t('Nav.Tool.Feedback', 'Feedback')}
            </a>
          </li>
          <li>
            <a href={Tutorial} target="_blank">
              {t('Nav.Tool.Tutorial', 'Tutorial')}
            </a>
          </li>*/}
          <li>
            <a href={Docs} target="_blank">
              {t('Nav.Tool.Docs', 'Docs')}
            </a>
          </li>
          {/*<li>
            <a href={TestNet} target="_blank">
              {t('Nav.Tool.Test', 'Testnet')}
            </a>
          </li>*/}
          <li>
            <a href={WhitePaper} target="_blank">
              {t('Nav.Tool.Whitepaper', 'Whitepaper')}
            </a>
          </li>
        </ul>
        {/*  <Community />*/}
      </div>
    </div>
  )
}

export default Tool
