import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import React, { FC, useContext, useMemo } from 'react'

import { usePairsInfo } from '@/zustand'
import { usePoolsInfo } from '@/zustand/usePoolsInfo'
import { MobileContext } from '@/context/Mobile'
import { usePCFRatioConf } from '@/hooks/useMatchConf'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { nonBigNumberInterception } from '@/utils/tools'

import QuestionPopover from '@/components/common/QuestionPopover'

const HeaderData: FC = () => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const { pcfRatio} = usePCFRatioConf()

  const indicators = usePairsInfo((state) => state.indicators)
  const positionsAmount = usePoolsInfo((state) => state.positionsAmount)

  const memoPosFeeRatio = useMemo(() => {
    if (pcfRatio || Number(pcfRatio) >= 0) return pcfRatio
    return '0'
  }, [pcfRatio])

  const memoPositionApy = useMemo(() => {
    const longPmrRate = indicators?.longPmrRate ?? 0
    const shortPmrRate = indicators?.shortPmrRate ?? 0
    return [
      Number(longPmrRate) <= 0 ? '0' : (longPmrRate * 100).toFixed(2),
      Number(shortPmrRate) <= 0 ? '0' : (shortPmrRate * 100).toFixed(2)
    ]
  }, [indicators])

  const positionInfo = useMemo(() => {
    if (!isEmpty(positionsAmount)) {
      const { long_position_amount = 0, short_position_amount = 0 } = positionsAmount
      const m = long_position_amount - short_position_amount
      const n = long_position_amount + short_position_amount
      const x = ((m / n) * 100).toFixed(2)
      return ([nonBigNumberInterception(m), n === 0 || m === 0 ? '0' : nonBigNumberInterception(x)])
    }
    return [0, 0]
  }, [positionsAmount])

  return (
    <div className='web-trade-kline-header-data'>
      <section>
        <h3>
          {t('Trade.kline.NetPositionRate', 'Net Position Rate')}
          <QuestionPopover size='mini' text={t('Trade.kline.NetPositionRateTip')} />
        </h3>
        {!mobile ? (
          <strong>
            {positionInfo[1]}% ( {positionInfo[0]} {BASE_TOKEN_SYMBOL} )
          </strong>
        ) : (
          <>
            <strong>{positionInfo[1]}%</strong>
            <small>
              ({positionInfo[0]} {BASE_TOKEN_SYMBOL})
            </small>
          </>
        )}
      </section>
      {!mobile && <hr />}
      <section>
        <h3>
          {t('Trade.kline.PCFRate', 'PCF Rate')}
          <QuestionPopover size='mini' text={t('Trade.kline.PCFRateTip')} />
        </h3>
        <strong>{nonBigNumberInterception(memoPosFeeRatio, 2)}%</strong>
      </section>
      {!mobile && <hr />}
      <section>
        <h3>
          {t('Trade.kline.PositionMiningAPY', 'Position Mining APR.')}
          <QuestionPopover size='mini' text={t('Trade.kline.PositionMiningAPYTip')} />
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
