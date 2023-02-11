import React, { FC } from 'react'

import { useAppDispatch } from '@/store'
import { useConfigInfo } from '@/zustand'
import { MARGIN_TOKENS } from '@/config/tokens'
import { MarginTokenKeys } from '@/typings'
import { useContractConfig } from '@/store/config/hooks'

const Margin: FC = () => {
  const dispatch = useAppDispatch()

  const { marginToken } = useContractConfig()

  const setMarginToken = useConfigInfo((state) => state.setMarginToken)

  return (
    <div className="">
      margin select:{marginToken}
      {MARGIN_TOKENS.map((t) => {
        return (
          <small key={t.symbol} onClick={() => {
            setMarginToken(t.symbol as MarginTokenKeys)
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
