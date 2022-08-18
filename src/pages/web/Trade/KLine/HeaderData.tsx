import React, { FC, useMemo, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { isEmpty } from 'lodash'
import BN from 'bignumber.js'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useConstantData } from '@/store/constant/hooks'
import { useContractData } from '@/store/contract/hooks'
import { nonBigNumberInterception, safeInterceptionValues } from '@/utils/tools'
import { MobileContext } from '@/context/Mobile'

import QuestionPopover from '@/components/common/QuestionPopover'

const HeaderData: FC = () => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)
  const { currentPair, pairs } = useContractData()
  const { positions, posFeeRatio } = useConstantData()

  const memoPositionInfo = useMemo(() => {
    if (!isEmpty(positions)) {
      const find = positions.find((p) => p.token === currentPair) ?? {}
      const { long_position_amount = 0, short_position_amount = 0 } = find
      const m = long_position_amount - short_position_amount
      const n = long_position_amount + short_position_amount
      const x = ((m / n) * 100).toFixed(2)
      // console.info(find, m, n, x)
      return [nonBigNumberInterception(m), n === 0 || m === 0 ? 0 : nonBigNumberInterception(x)]
    }
    return ['0', '0']
  }, [positions, currentPair, pairs])

  const memoPosFeeRatio = useMemo(() => {
    if (!isEmpty(posFeeRatio)) {
      const key = Object.keys(posFeeRatio).find((p) => p === currentPair) ?? ''
      return posFeeRatio[key]
    }
    return '0'
  }, [posFeeRatio, currentPair, pairs])

  const memoPositionApy = useMemo(() => {
    // longPmrRate shortPmrRate
    const find = pairs.find((p) => p.token === currentPair) ?? { longPmrRate: 0, shortPmrRate: 0 }
    // console.info(find)
    return [
      Number(find.longPmrRate) <= 0 ? '--' : (find.longPmrRate * 100).toFixed(2),
      Number(find.shortPmrRate) <= 0 ? '--' : (find.shortPmrRate * 100).toFixed(2)
    ]
  }, [pairs, currentPair])

  return (
    <div className="web-trade-kline-header-data">
      <section>
        <h3>
          {t('Trade.kline.NetPositionRate', 'Net Position Rate')}
          <QuestionPopover size="mini" text={t('Trade.kline.NetPositionRateTip')} />
        </h3>
        {!mobile ? (
          <strong>
            {memoPositionInfo[1]}% ( {memoPositionInfo[0]} {BASE_TOKEN_SYMBOL} )
          </strong>
        ) : (
          <>
            <strong>{memoPositionInfo[1]}%</strong>
            <small>
              ({memoPositionInfo[0]} {BASE_TOKEN_SYMBOL})
            </small>
          </>
        )}
      </section>
      {!mobile && <hr />}
      <section>
        <h3>
          {t('Trade.kline.PCFRate', 'PCF Rate')}
          <QuestionPopover size="mini" text={t('Trade.kline.PCFRateTip')} />
        </h3>
        <strong>{memoPosFeeRatio}%</strong>
      </section>
      {!mobile && <hr />}
      <section>
        <h3>
          {t('Trade.kline.PositionMiningAPY', 'Position Mining APY.')}
          <QuestionPopover size="mini" text={t('Trade.kline.PositionMiningAPYTip')} />
        </h3>
        {mobile ? (
          <>
            <aside>
              <strong>{memoPositionApy[0]}%</strong>
              <small>Long</small>
            </aside>
            <aside>
              <strong>{memoPositionApy[1]}%</strong>
              <small>Short</small>
            </aside>
          </>
        ) : (
          <strong>
            {memoPositionApy[0]}% <small>Long</small> / {memoPositionApy[1]}% <small>Short</small>
          </strong>
        )}
      </section>
    </div>
  )
}

export default HeaderData
