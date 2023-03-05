import dayjs from 'dayjs'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useContext } from 'react'

import { PositionSide } from '@/store/contract/helper'
import { MobileContext } from '@/context/Mobile'
import { useMarginToken } from '@/zustand'
import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'

import ItemHeader from '../c/ItemHeader'
import AtomWrap from '../c/AtomWrap'
import DataAtom from '../c/DataAtom'

interface Props {
  data?: Record<string, any>
  onClick: () => void
}

const MyOrderListItem: FC<Props> = ({ data, onClick }) => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const marginToken = useMarginToken((state) => state.marginToken)

  const memoTimestamp = useMemo(() => {
    return dayjs((data?.timestamp ?? 0) * 1000)
  }, [data?.timestamp])

  // OrderDesc[data?.orderType][1]}
  const OrderDescLang = useMemo(() => {
    return [
      ['Open', t('Trade.MyOrder.LimitPrice', 'Limit Price')], // Limit
      ['Close', t('Trade.MyOrder.TakeProfit', 'Take Profit')], // StopProfit
      ['Close', t('Trade.MyOrder.StopLoss', 'Stop Loss')] // StopLoss
    ]
  }, [t])

  const atom1Tsx = useMemo(
    () => (
      <DataAtom label={t('Trade.MyOrder.Type', 'Type')} footer={OrderDescLang[data?.orderType][1]}>
        <span className={classNames(`${OrderDescLang[data?.orderType][0] === 'Open' ? 'up' : 'down'}`)}>
          {t(`Trade.MyOrder.${OrderDescLang[data?.orderType][0]}`, OrderDescLang[data?.orderType][0])}
        </span>
      </DataAtom>
    ),
    [data?.orderType, t, OrderDescLang]
  )

  const atom2Tsx = useMemo(
    () => (
      <DataAtom
        label={t('Trade.MyOrder.Volume', 'Volume')}
        tip={t('Trade.MyOrder.VolumeTip')}
        footer={`${data?.quoteToken} / ${marginToken}`}
      >
        <span>
          {data?.size} / {data?.volume}
        </span>
      </DataAtom>
    ),
    [data, marginToken, t]
  )
  const atom3Tsx = useMemo(
    () => (
      <DataAtom label={t('Trade.MyOrder.Price', 'Price')} footer={VALUATION_TOKEN_SYMBOL}>
        <span>{data?.price}</span>
      </DataAtom>
    ),
    [data?.price, t]
  )
  const atom4Tsx = useMemo(
    () => (
      <DataAtom label={t('Trade.MyOrder.Time', 'Time')} footer={data?.timestamp ? memoTimestamp.fromNow() : '-'}>
        <span>{data?.timestamp ? memoTimestamp.format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
      </DataAtom>
    ),
    [data?.timestamp, memoTimestamp, t]
  )

  return (
    <>
      <div className="web-trade-data-item">
        <ItemHeader
          symbol={`${data?.quoteToken}${marginToken}`}
          multiple={data?.leverage}
          direction={PositionSide[data?.side] as any}
          buttonText={t('Trade.MyOrder.Cancel', 'Cancel')}
          onButtonClick={onClick}
        />
        {mobile ? (
          <>
            <AtomWrap>
              {atom1Tsx}
              {atom2Tsx}
            </AtomWrap>
            <hr />
            <AtomWrap>
              {atom3Tsx}
              {atom4Tsx}
            </AtomWrap>
          </>
        ) : (
          <AtomWrap>
            {atom1Tsx}
            {atom2Tsx}
            {atom3Tsx}
            {atom4Tsx}
          </AtomWrap>
        )}
      </div>
    </>
  )
}

export default MyOrderListItem
