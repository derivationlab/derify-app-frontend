import React, { FC, useMemo } from 'react'

import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { useCurrentPositions } from '@/hooks/useCurrentPositions'
import { Rec } from '@/typings'
import { bnPlus, keepDecimals } from '@/utils/tools'

const PositionVolume: FC<{ data: Rec }> = ({ data }) => {
  const { data: positionsDAT } = useCurrentPositions('all', data.margin_token)

  const volume = useMemo(() => {
    if (positionsDAT) {
      const { long_position_amount = 0, short_position_amount = 0 } = positionsDAT
      return bnPlus(long_position_amount, short_position_amount)
    }
    return '0'
  }, [positionsDAT])

  return <BalanceShow value={keepDecimals(volume, 2)} unit={data.symbol} />
}

export default PositionVolume
