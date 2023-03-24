import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo } from 'react'

import { MARGIN_TOKENS } from '@/config/tokens'
import { useMarginToken } from '@/store'
import { MarginTokenKeys } from '@/typings'

import { Select } from '@/components/common/Form'
import Image from '@/components/common/Image'

const MarginToken: FC = () => {
  const history = useHistory()

  const { t } = useTranslation()

  const marginToken = useMarginToken((state) => state.marginToken)
  const updateMarginToken = useMarginToken((state) => state.updateMarginToken)

  const marginOptions = useMemo(() => {
    return MARGIN_TOKENS.map((t) => ({
      value: t.symbol,
      label: t.symbol,
      icon: `market/${t.symbol.toLowerCase()}.svg`
    }))
  }, [])

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
          <div className="web-select-options-item">
            {props.icon && <Image src={props.icon} />}
            {props.label}
          </div>
        )}
        className="web-trade-bench-margin-select"
        objOptions={marginOptions}
        labelRenderer={(props) => (
          <div className="web-dashboard-add-grant-margin-label">
            {props.icon && <Image src={props.icon} />}
            <span>{props.label}</span>
          </div>
        )}
        filterPlaceholder="Search name or contract address..."
      />
    </div>
  )
}

export default MarginToken
