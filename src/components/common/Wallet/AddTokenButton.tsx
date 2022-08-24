import React, { FC, useState, useRef } from 'react'
import { useAccount } from 'wagmi'
import { useClickAway } from 'react-use'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import tokensInfo from '@/config/tokens'
import { PANCAKE_SWAP_URL } from '@/config'

import { getAddress } from '@/utils/addressHelpers'
import { addToken2Wallet } from '@/utils/practicalMethod'

import Button from '@/components/common/Button'

const AddTokenButton: FC = () => {
  const { t } = useTranslation()
  const { data: account } = useAccount()
  const ref = useRef(null)
  const [menuStatus, setMenuStatus] = useState<boolean>(false)

  useClickAway(ref, () => {
    setMenuStatus(false)
  })

  const tokens: Record<string, any>[] = [
    { ...tokensInfo.DRF, image: '', direction: 0 },
    { ...tokensInfo.eDRF, image: '', direction: 0 },
    { ...tokensInfo.bBUSD, image: '', direction: 1 }
  ]

  const addToken = (token: Record<string, any>) => {
    void addToken2Wallet(getAddress(token.address), token.symbol, token.decimals, token.image)
    setMenuStatus(false)
  }
  const buyToken = (token: Record<string, any>) => {
    if (token.direction === 'Sell') {
      window.open(`${PANCAKE_SWAP_URL}swap?inputCurrency=${getAddress(token.address)}`)
    } else {
      window.open(`${PANCAKE_SWAP_URL}swap?outputCurrency=${getAddress(token.address)}`)
    }
    setMenuStatus(false)
  }
  if (!account?.address) return null
  return (
    <div className="web-addtoken-button" ref={ref}>
      <Button size="mini" outline onClick={() => setMenuStatus(!menuStatus)}>
        {t('Nav.Nav.AddToken', 'Add Token')}
      </Button>
      <div className={classNames('web-addtoken-menu', { show: menuStatus })}>
        <ul>
          {tokens.map((token, index) => (
            <li key={`add-${index}`} onClick={() => addToken(token)}>
              {t('Nav.AddToken.Add', 'Add Token', { token: token.symbol })}
            </li>
          ))}
          <hr />
          {tokens.map((token, index) => (
            <li key={`buy-${index}`} onClick={() => buyToken(token)}>
              {token.direction === 0
                ? t('Nav.AddToken.Buy', 'Add Token', { token: token.symbol })
                : t('Nav.AddToken.Sell', 'Add Token', { token: token.symbol })}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default AddTokenButton
