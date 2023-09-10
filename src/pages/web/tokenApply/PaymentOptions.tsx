import { Select } from '@arco-design/web-react'
import classNames from 'classnames'

import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import Image from '@/components/common/Image'
import tokens from '@/config/tokens'

const Option = Select.Option
const baseURI = 'https://s2.coinmarketcap.com/static/img/coins/64x64/'
export const paymentTypeOptions = [
  {
    key: tokens.drf.symbol,
    val: tokens.drf.tokenAddress,
    img: `${baseURI}19025.png`
  },
  {
    key: tokens.usdt.symbol,
    val: tokens.usdt.tokenAddress,
    img: `${baseURI}21763.png`
  }
]
export const paymentTypeOptionsDef = paymentTypeOptions[0].val

const PaymentOptions = ({ onChange }: { onChange: (p: string) => void }) => {
  const { t } = useTranslation()
  const [visible, setVisible] = useBoolean(false)
  const [selected, setSelected] = useState<string>(paymentTypeOptionsDef)

  const triggerElement = useMemo(() => {
    const target = paymentTypeOptions.find((l) => l.val === selected)
    return (
      <div className="form-item-select s">
        <span className="form-item-select-label">{t('Apply.Payment')}</span>
        <div className="form-item-select-right">
          <Image src={target?.img} />
          <span className={classNames({ active: visible })}>{target?.key}</span>
          <em className={classNames({ active: visible })} />
        </div>
      </div>
    )
  }, [t, selected, visible])

  useEffect(() => {
    onChange(paymentTypeOptionsDef)
  }, [])

  return (
    <Select
      onChange={(v) => {
        onChange(v)
        setSelected(v)
      }}
      triggerElement={triggerElement}
      onVisibleChange={setVisible}
    >
      {paymentTypeOptions.map((l) => (
        <Option className="option" key={l.key} value={l.val}>
          <Image src={l.img} />
          <span>{l.key}</span>
        </Option>
      ))}
    </Select>
  )
}

export default PaymentOptions
