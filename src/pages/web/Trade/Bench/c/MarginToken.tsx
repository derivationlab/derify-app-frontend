import classNames from 'classnames'
import { orderBy } from 'lodash'
import { useAccount } from 'wagmi'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useEffect, useMemo, useReducer } from 'react'

import { findToken } from '@/config/tokens'
import { MarginTokenKeys } from '@/typings'
import { reducer, stateInit } from '@/reducers/records'
import { getMarginTokenList } from '@/api'
import { useMarginTokenStore } from '@/store'
import { useAllMarginBalances } from '@/hooks/useProfile'

import { Select } from '@/components/common/Form'
import Image from '@/components/common/Image'

const MarginToken: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const history = useHistory()

  const { t } = useTranslation()
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const updateMarginToken = useMarginTokenStore((state) => state.updateMarginToken)

  const { data: marginBalances, isLoading: marginBalancesLoaded } = useAllMarginBalances(address)

  const options = useMemo(() => {
    if (!state.records.loaded && !marginBalancesLoaded && marginBalances) {
      const _ = state.records.records.map((token) => {
        const marginBalance = marginBalances[token.symbol as MarginTokenKeys]
        return {
          apy: token.max_pm_apy,
          open: token.open,
          icon: findToken(token.symbol).icon,
          value: token.symbol,
          label: token.symbol,
          marginBalance,
        }
      })
      return orderBy(_, ['marginBalance', 'apy'], 'desc')
    }
    return []
  }, [state.records, marginBalances, marginBalancesLoaded])

  const _getMarginTokenList = useCallback(
    async (index = 0) => {
      if (address) {
        const { data } = await getMarginTokenList(index)
        dispatch({
          type: 'SET_RECORDS',
          payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
        })
      }
    },
    [address]
  )

  useEffect(() => {
    if (address) void _getMarginTokenList()
  }, [address])

  return (
    <div className="web-trade-bench-margin">
      {
        options.length > 0 && (
          <Select
            large
            filter
            label={t('Trade.Bench.Margin')}
            value={marginToken as any}
            onChange={(v) => {
              updateMarginToken(v as MarginTokenKeys)
              history.push(`/${v}/trade`)
            }}
            renderer={(props) => (
              <div className={classNames('web-select-options-item', { close: !props.open })}>
                {props?.icon && <Image src={props?.icon} />}
                {props?.label}
              </div>
            )}
            className="web-trade-bench-margin-select"
            objOptions={options as any}
            labelRenderer={() => (
              <div className="web-dashboard-add-grant-margin-label">
                <Image src={findToken(marginToken).icon} />
                <span>{findToken(marginToken).symbol}</span>
              </div>
            )}
            filterPlaceholder="Search name or contract address..."
          />
        )
      }
    </div>
  )
}

export default MarginToken
