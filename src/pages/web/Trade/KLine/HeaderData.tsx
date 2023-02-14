import PubSub from 'pubsub-js'
import { useInterval } from 'react-use'
import { useTranslation } from 'react-i18next'
import React, { FC, useContext, useEffect, useMemo, useState } from 'react'

import { usePairsInfo } from '@/zustand'
import { PubSubEvents } from '@/typings'
import { MobileContext } from '@/context/Mobile'
import { usePCFRatioConf } from '@/hooks/useMatchConf'
import { nonBigNumberInterception } from '@/utils/tools'
import { BASE_TOKEN_SYMBOL, findToken } from '@/config/tokens'
import { getCurrentPositionsAmountData } from '@/store/constant/helper'

import QuestionPopover from '@/components/common/QuestionPopover'

const HeaderData: FC = () => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)
  const { pcfRatio, quoteToken } = usePCFRatioConf()

  const indicators = usePairsInfo((state) => state.indicators)

  const [positionInfo, setPositionInfo] = useState<string[]>(['0', '0'])

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

  const funcAsync = async () => {
    const data = await getCurrentPositionsAmountData(findToken(quoteToken).tokenAddress)

    if (data) {
      const { long_position_amount = 0, short_position_amount = 0 } = data
      const m = long_position_amount - short_position_amount
      const n = long_position_amount + short_position_amount
      const x = ((m / n) * 100).toFixed(2)

      setPositionInfo([nonBigNumberInterception(m), n === 0 || m === 0 ? '0' : nonBigNumberInterception(x)])
    }
  }

  useInterval(() => {
    void funcAsync()
  }, 60000)

  useEffect(() => {
    setPositionInfo(['0', '0'])

    void funcAsync()

    PubSub.subscribe(PubSubEvents.UPDATE_POSITION_AMOUNT, () => {
      void funcAsync()
    })

    return () => {
      PubSub.clearAllSubscriptions()
    }
  }, [quoteToken])

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
        <strong>{memoPosFeeRatio}%</strong>
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
