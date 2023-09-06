import { Select } from '@arco-design/web-react'
import classNames from 'classnames'

import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import Image from '@/components/common/Image'
import Spinner from '@/components/common/Spinner'
import { useTradingList } from '@/hooks/useApplyToken'

const Option = Select.Option

const TokenOptions = ({ onChange, marginToken }: { onChange: (p: string) => void; marginToken: string }) => {
  const { t } = useTranslation()
  const [visible, setVisible] = useBoolean(false)
  const [selected, setSelected] = useState<string>('')
  const { tradingList, tradingLoad } = useTradingList(marginToken)

  const triggerElement = useMemo(() => {
    const target = tradingList.find((l) => l.token === selected)
    return (
      <div className="form-item-select s">
        <span className="form-item-select-label">{t('Apply.Trading')}</span>
        <div className="form-item-select-right">
          {tradingLoad && <Spinner mini />}
          {target && (
            <>
              <Image src={target?.logo} />
              <span className={classNames({ active: visible })}>{target?.symbol}</span>
              <em className={classNames({ active: visible })} />
            </>
          )}
          {!target && !tradingLoad && <small>{t('Apply.NoData')}</small>}
        </div>
      </div>
    )
  }, [t, selected, visible, tradingLoad])

  useEffect(() => {
    if (tradingList.length) {
      const _ = tradingList[0]?.token
      onChange(_)
      setSelected(_)
    }
  }, [tradingList])

  return (
    <Select
      disabled={tradingLoad}
      onChange={(v) => {
        onChange(v)
        setSelected(v)
      }}
      triggerElement={triggerElement}
      onVisibleChange={setVisible}
      notFoundContent={<small className="search-null">{t('Apply.NoData')}</small>}
    >
      {tradingList.map((l) => (
        <Option className="option" key={l.token} value={l.token}>
          <Image src={l.logo} />
          <span>{l.symbol}</span>
        </Option>
      ))}
    </Select>
  )
}

export default TokenOptions
