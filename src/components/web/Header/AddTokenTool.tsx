import classNames from 'classnames'

import React, { FC, useState, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickAway } from 'react-use'

import { PANCAKE_SWAP_URL } from '@/config'
import tokens from '@/config/tokens'
import { useMarginTokenStore, useProtocolConfigStore } from '@/store'
import { addToken } from '@/utils/addToken'

const AddTokenTool: FC = () => {
  const ref = useRef(null)

  const { t } = useTranslation()

  const [menuStatus, setMenuStatus] = useState<boolean>(false)

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)

  const memoTokens = useMemo(() => {
    return [
      {
        swap: `swap?inputCurrency=${tokens.busd.tokenAddress}&outputCurrency=${tokens.drf.tokenAddress}`,
        image: '',
        symbol: tokens.drf.symbol,
        address: tokens.drf.tokenAddress,
        decimals: tokens.drf.precision,
        direction: 0
      },
      {
        image: '',
        symbol: tokens.edrf.symbol,
        address: tokens.edrf.tokenAddress,
        decimals: tokens.edrf.precision,
        direction: 0
      },
      {
        image: '',
        symbol: `b${marginToken.symbol}`,
        address: protocolConfig?.bMarginToken,
        decimals: 18,
        direction: 1
      }
    ]
  }, [protocolConfig, marginToken])

  const _addToken = (token: Record<string, any>) => {
    void addToken(token.address, token.symbol, token.decimals, token.image)
    setMenuStatus(false)
  }

  const buyToken = (token: Record<string, any>) => {
    if (token.direction === 'Sell') {
      window.open(`${PANCAKE_SWAP_URL}swap?inputCurrency=${token.address}`)
    } else {
      window.open(`${PANCAKE_SWAP_URL}${token.swap}`)
    }
    setMenuStatus(false)
  }

  useClickAway(ref, () => setMenuStatus(false))

  return (
    <div className="web-header-select-lang" ref={ref}>
      <div className="web-header-select-lang-label" onClick={() => setMenuStatus(!menuStatus)}>
        <label>{t('Nav.Tool.Token')}</label>
        <span></span>
      </div>
      <ul className={classNames('web-header-select-lang-menu', { show: menuStatus })}>
        {memoTokens.map((token, index) => (
          <li key={`add-${index}`} onClick={() => _addToken(token)}>
            {t('Nav.AddToken.Add', 'Add Token', { token: token.symbol })}
          </li>
        ))}
        <hr />
        {memoTokens.slice(0, 1).map((token, index) => (
          <li key={`buy-${index}`} onClick={() => buyToken(token)}>
            {token.direction === 0
              ? t('Nav.AddToken.Buy', 'Add Token', { token: token.symbol })
              : t('Nav.AddToken.Sell', 'Add Token', { token: token.symbol })}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AddTokenTool
