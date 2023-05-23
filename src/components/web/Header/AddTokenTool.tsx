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
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/19025.png',
        symbol: tokens.drf.symbol,
        address: tokens.drf.tokenAddress,
        decimals: tokens.drf.precision
      },
      {
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/19025.png',
        symbol: tokens.edrf.symbol,
        address: tokens.edrf.tokenAddress,
        decimals: tokens.edrf.precision
      },
      {
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/19025.png',
        symbol: `b${marginToken.symbol}`,
        address: protocolConfig?.bMarginToken,
        decimals: 18
      }
    ]
  }, [protocolConfig, marginToken])

  const pancakeSwap = useMemo(() => {
    const { symbol, precision: decimals, tokenAddress: address } = tokens.drf
    const { tokenAddress: busd } = tokens.busd
    const swap = `swap?inputCurrency=${busd}&outputCurrency=${address}`
    return [
      {
        swap,
        symbol,
        address,
        direction: 0
      }
    ]
  }, [])

  const _addToken = (token: Record<string, any>) => {
    void addToken(token.address, token.symbol, token.decimals, token.image)
    setMenuStatus(false)
  }

  const _buyToken = (token: Record<string, any>) => {
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
        <span />
      </div>
      <ul className={classNames('web-header-select-lang-menu', { show: menuStatus })}>
        {memoTokens.map((token, index) => (
          <li key={`add-${index}`} onClick={() => _addToken(token)}>
            {t('Nav.AddToken.Add', 'Add Token', { token: token.symbol })}
          </li>
        ))}
        <hr />
        {pancakeSwap.map((token, index) => (
          <li key={`buy-${index}`} onClick={() => _buyToken(token)}>
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
