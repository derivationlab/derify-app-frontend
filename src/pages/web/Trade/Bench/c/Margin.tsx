import React, { FC } from 'react'

import { useAppDispatch } from '@/store'
import { useMarginToken } from '@/zustand'
import { MARGIN_TOKENS } from '@/config/tokens'
import { MarginTokenKeys } from '@/typings'
import { useContractConfig } from '@/store/config/hooks'
import { setMarginToken } from '@/store/config'

const Margin: FC = () => {
  const dispatch = useAppDispatch()

  const { marginToken } = useContractConfig()

  const updateMarginToken = useMarginToken((state) => state.updateMarginToken)

  return (
    <div className="">
      margin select:{marginToken}
      {MARGIN_TOKENS.map((t) => {
        return (
          <small key={t.symbol} onClick={() => {
            updateMarginToken(t.symbol as MarginTokenKeys)
            dispatch(setMarginToken(t.symbol as MarginTokenKeys))
          }}>
            {t.symbol}
          </small>
        )
      })}
    </div>
  )
}

export default Margin
