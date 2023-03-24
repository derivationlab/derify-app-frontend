import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useEffect, useMemo, useReducer } from 'react'

import { findToken, MARGIN_TOKENS } from '@/config/tokens'
import { useMarginToken } from '@/store'
import { MarginTokenKeys } from '@/typings'

import { Select } from '@/components/common/Form'
import Image from '@/components/common/Image'
import { getMySpaceMarginTokenList } from '@/api'
import { useAccount } from 'wagmi'
import { reducer, stateInit } from '@/reducers/mySpace'
import classNames from 'classnames'

const MarginToken: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const history = useHistory()

  const { t } = useTranslation()
  const { address } = useAccount()

  const marginToken = useMarginToken((state) => state.marginToken)
  const updateMarginToken = useMarginToken((state) => state.updateMarginToken)

  const marginOptions = useMemo(() => {
    return state.marginData.records.map((t) => ({
      value: t.symbol,
      label: t.symbol,
      isOpen: !!t.open,
      icon: findToken(t.symbol).icon
    }))
  }, [state.marginData])

  const defaultMargin = useMemo(() => {
    return {
      value: marginToken,
      label: marginToken,
      isOpen: true,
      icon: findToken(marginToken).icon
    }
  }, [marginToken])

  // todo more margins loading...
  const fetchData = useCallback(
    async (index = 0) => {
      if (address) {
        const { data } = await getMySpaceMarginTokenList(address, index, 10)

        dispatch({
          type: 'SET_MARGIN_DAT',
          payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
        })
      }
    },
    [address]
  )

  useEffect(() => {
    if (address) void fetchData()
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
            <Image src={defaultMargin.icon} />
            <span>{defaultMargin.label}</span>
          </div>
        )}
        filterPlaceholder="Search name or contract address..."
      />
    </div>
  )
}

export default MarginToken
