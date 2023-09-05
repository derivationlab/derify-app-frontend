import { Select } from '@arco-design/web-react'
import classNames from 'classnames'

import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

const Option = Select.Option
export const applyTypeOptions = [
  {
    key: 'Margin Token List',
    val: 'MARGIN_APPLY'
  },
  {
    key: 'Trading Token List',
    val: 'TRADING_APPLY'
  }
]
export const applyTypeOptionsDef = applyTypeOptions[0].val

const ApplyOptions = () => {
  const { t } = useTranslation()
  const [visible, setVisible] = useBoolean(false)
  const [selected, setSelected] = useState<string>(applyTypeOptions[0].val)

  const triggerElement = useMemo(() => {
    return (
      <div className="form-item-select">
        <span>{t(`Apply.${applyTypeOptions.find((l) => l.val === selected)?.val}`)}</span>
        <em className={classNames({ open: visible })} />
      </div>
    )
  }, [t, selected, visible])

  return (
    <Select onChange={setSelected} triggerElement={triggerElement} onVisibleChange={setVisible}>
      {applyTypeOptions.map((l) => (
        <Option key={l.key} value={l.val}>
          {t(`Apply.${l.val}`)}
        </Option>
      ))}
    </Select>
  )
}

export default ApplyOptions
