import classNames from 'classnames'
import { orderBy } from 'lodash'
import { useAccount } from 'wagmi'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useEffect, useMemo, useReducer } from 'react'

import { DEFAULT_MARGIN_TOKEN, findToken, MARGIN_TOKENS } from '@/config/tokens'
import { useMarginTokenStore } from '@/store'
import { MarginTokenKeys } from '@/typings'
import { reducer, stateInit } from '@/reducers/records'
import { useAllMarginBalances } from '@/hooks/useMySpaceInfo'
import { getMySpaceMarginTokenList } from '@/api'

import { Select } from '@/components/common/Form'
import Image from '@/components/common/Image'

const MarginToken: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const history = useHistory()

  const { t } = useTranslation()
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const updateMarginToken = useMarginTokenStore((state) => state.updateMarginToken)

  const { data: marginBalances, refetch: marginBalancesRefetch, isLoading } = useAllMarginBalances(address)

  const marginOptions = useMemo(() => {
    if (!state.records.loaded && !isLoading) {
      const _ = MARGIN_TOKENS.map((token) => {
        const p0 = state.records.records.find((data) => data.symbol === token.symbol)
        const p1 = marginBalances[token.symbol as MarginTokenKeys]
        return {
          apy: p0?.max_pm_apy ?? 0,
          icon: findToken(token.symbol).icon,
          value: token.symbol,
          label: token.symbol,
          isOpen: p0?.open ?? 0,
          marginBalance: p1
        }
      })
      return orderBy(_, ['marginBalance', 'apy'], 'desc')
    }
    return []
  }, [isLoading, state.records, marginBalances])

  // todo more margins loading...
  const fetchData = useCallback(
    async (index = 0) => {
      if (address) {
        const { data } = await getMySpaceMarginTokenList(address, index, 10)

        dispatch({
          type: 'SET_RECORDS',
          payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
        })
      }
    },
    [address]
  )

  useEffect(() => {
    if (address) {
      void fetchData()
      void marginBalancesRefetch()
    }
  }, [address])

  return (
    <div className="web-trade-bench-margin">
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
          <div className={classNames('web-select-options-item', { close: !props.isOpen })}>
            {props?.icon && <Image src={props?.icon} />}
            {props?.label}
          </div>
        )}
        className="web-trade-bench-margin-select"
        objOptions={marginOptions}
        labelRenderer={() => (
          <div className="web-dashboard-add-grant-margin-label">
            <Image src={DEFAULT_MARGIN_TOKEN.icon} />
            <span>{DEFAULT_MARGIN_TOKEN.symbol}</span>
          </div>
        )}
        filterPlaceholder="Search name or contract address..."
      />
    </div>
  )
}

export default MarginToken
