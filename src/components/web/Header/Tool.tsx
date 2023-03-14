import classNames from 'classnames'
import { useClickAway } from 'react-use'
import { useTranslation } from 'react-i18next'
import React, { FC, useState, useRef } from 'react'

import { Docs, WhitePaper } from '@/data/links'
import { useMTokenFromRoute } from '@/hooks/useTrading'

import SelectLang from './SelectLang'
import SelectTheme from './SelectTheme'
import AddTokenTool from './AddTokenTool'

const Tool: FC = () => {
  const ref = useRef(null)

  const { t } = useTranslation()

  const marginToken = useMTokenFromRoute()

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
            <a href={Docs} target="_blank">
              {t('Nav.Tool.Docs', 'Docs')}
            </a>
          </li>
          <li>
            <a href={WhitePaper} target="_blank">
              {t('Nav.Tool.Whitepaper', 'Whitepaper')}
            </a>
          </li>
          <li>
            <a href={`/${marginToken}/system/parameters`}>System Parameters</a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Tool
