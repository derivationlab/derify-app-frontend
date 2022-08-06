import React, { FC, useMemo } from 'react'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import BN from 'bignumber.js'

import { useContractData } from '@/store/contract/hooks'

import ConnectButton from '@/components/common/Wallet/ConnectButton'
import Button from '@/components/common/Button'

interface Props {
  address?: string
  isKline: boolean
  goBench: () => void
}

const MobileFixed: FC<Props> = ({ address, isKline, goBench }) => {
  const { t } = useTranslation()
  const { pairs, currentPair } = useContractData()

  const memoPairInfo = useMemo(() => {
    return pairs.find((pair) => pair.token === currentPair)
  }, [pairs, currentPair])

  const memoLongPosApy = useMemo(() => {
    if (!isEmpty(memoPairInfo) && memoPairInfo?.longPmrRate) {
      const apy = new BN(memoPairInfo?.longPmrRate).times(100)
      return apy.isLessThanOrEqualTo(0) ? '--' : String(apy)
    }
    return '--'
  }, [memoPairInfo])

  const memoShortPosApy = useMemo(() => {
    if (!isEmpty(memoPairInfo) && memoPairInfo?.shortPmrRate) {
      const apy = new BN(memoPairInfo?.shortPmrRate).times(100)
      return apy.isLessThanOrEqualTo(0) ? '--' : String(apy)
    }
    return '--'
  }, [memoPairInfo])

  if (!isKline) return null

  return (
    <div className="m-trade-fixed">
      {address ? (
        <>
          <Button className="web-trade-bench-button-short" onClick={goBench} type="buy">
            <strong>{t('Trade.Bench.Long', 'Long')}</strong>
            <em>
              {memoLongPosApy}%<u>APY</u>
            </em>
          </Button>
          <Button className="web-trade-bench-button-short" onClick={goBench} type="sell">
            <strong>{t('Trade.Bench.Short', 'Short')}</strong>
            <em>
              {memoShortPosApy}%<u>APY</u>
            </em>
          </Button>
        </>
      ) : (
        <ConnectButton size="default" />
      )}
    </div>
  )
}

export default MobileFixed
