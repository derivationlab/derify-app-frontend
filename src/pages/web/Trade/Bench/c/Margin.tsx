import React, { FC } from 'react'

import { useAppDispatch } from '@/store'
import { MARGIN_TOKENS } from '@/config/tokens'
import { setMarginToken } from '@/store/actions'
import { useContractConfig } from '@/store/config/hooks'

const Margin: FC = () => {
  const dispatch = useAppDispatch()

  const { marginToken } = useContractConfig()

  return (
    <div className="">
      margin select:{marginToken}
      {MARGIN_TOKENS.map((t) => {
        return (<small key={t.symbol} onClick={() => dispatch(setMarginToken(t.symbol))}>{t.symbol}</small>)
      })}
    </div>
  )
}

export default Margin
