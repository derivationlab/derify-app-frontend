import { isEmpty } from 'lodash'
import { useInterval } from 'react-use'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { MobileContext } from '@/context/Mobile'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useShareMessage } from '@/store/share/hooks'
import { useConstantData } from '@/store/constant/hooks'
import { useContractData } from '@/store/contract/hooks'
import { nonBigNumberInterception } from '@/utils/tools'
import { getCurrentPositionsAmountData } from '@/store/constant/helper'

import QuestionPopover from '@/components/common/QuestionPopover'

const HeaderData: FC = () => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)
  const { posFeeRatio } = useConstantData()
  const { shareMessage } = useShareMessage()
  const { currentPair, pairs } = useContractData()

  const [positionInfo, setPositionInfo] = useState<string[]>(['0', '0'])

  const getPositionsAmountFunc = async (currentPair: string) => {
    const data = await getCurrentPositionsAmountData(currentPair)

    if (data) {
      const { long_position_amount = 0, short_position_amount = 0 } = data
      const m = long_position_amount - short_position_amount
      const n = long_position_amount + short_position_amount
      const x = ((m / n) * 100).toFixed(2)

      setPositionInfo([nonBigNumberInterception(m), n === 0 || m === 0 ? '0' : nonBigNumberInterception(x)])
    }
  }

  const memoPosFeeRatio = useMemo(() => {
    if (!isEmpty(posFeeRatio)) {
      const key = Object.keys(posFeeRatio).find((p) => p === currentPair) ?? ''
      return posFeeRatio[key] ?? '0'
    }
    return '0'
  }, [posFeeRatio, currentPair, pairs])

  const memoPositionApy = useMemo(() => {
    const find = pairs.find((p) => p.token === currentPair)
    const longPmrRate = find?.longPmrRate ?? 0
    const shortPmrRate = find?.shortPmrRate ?? 0
    return [
      Number(longPmrRate) <= 0 ? '--' : (longPmrRate * 100).toFixed(2),
      Number(shortPmrRate) <= 0 ? '--' : (longPmrRate * 100).toFixed(2)
    ]
  }, [pairs, currentPair])

  useInterval(() => {
    void getPositionsAmountFunc(currentPair)
  }, 60000)

  useEffect(() => {
    setPositionInfo(['0', '0'])

    void getPositionsAmountFunc(currentPair)
  }, [currentPair])

  useEffect(() => {
    if (shareMessage && shareMessage?.type.includes('UPDATE_POSITIONS_AMOUNT')) void getPositionsAmountFunc(currentPair)
  }, [shareMessage])

  return (
    <div className="web-trade-kline-header-data">
      <section>
        <h3>
          {t('Trade.kline.NetPositionRate', 'Net Position Rate')}
          <QuestionPopover size="mini" text={t('Trade.kline.NetPositionRateTip')} />
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
