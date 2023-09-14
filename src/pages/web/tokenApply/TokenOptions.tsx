import { Select, Avatar } from '@arco-design/web-react'
import classNames from 'classnames'
import { isEmpty } from 'lodash'

import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import Image from '@/components/common/Image'
import Spinner from '@/components/common/Spinner'
import { useTradingList } from '@/hooks/useApplyToken'
import { MultipleToken } from '@/pages/web/tokenApply/MultipleToken'

const Option = Select.Option

const TokenOptions = ({ onChange, marginToken }: { onChange: (p: string[]) => void; marginToken: string }) => {
  const { t } = useTranslation()
  const [visible, setVisible] = useBoolean(false)
  const [selected, setSelected] = useState<string[]>([])
  const { tradingList } = useTradingList(marginToken)

  const innerContent = useMemo(() => {
    const { list, loaded } = tradingList
    console.info(tradingList)
    if (loaded) return <Spinner mini />
    if (!loaded && list.length === 0) return <small className="null">{t('Apply.NoData')}</small>
    if (!loaded && list.length > 0) {
      const filterTradingList = list.filter((l) => selected.includes(l.token))
      if (list.length > 0 && selected.length === 0) return <small className="null">{t('Apply.Select')}</small>
      if (filterTradingList.length > 0) {
        if (filterTradingList.length === 1) {
          const nodes = filterTradingList.map((l) => (
            <>
              <Image src={l?.logo} className="token-icon" />
              <span className={classNames({ active: visible })}>{l?.symbol}</span>
            </>
          ))
          return (
            <>
              {nodes}
              <em className={classNames('arrow', { active: visible })} />
            </>
          )
        } else {
          const logos = filterTradingList.map((l) => l.logo)
          return (
            <>
              <MultipleToken data={logos} />
              <em className={classNames('arrow', { active: visible })} />
            </>
          )
        }
      }
    }
  }, [visible, selected, tradingList])

  const triggerElement = useMemo(() => {
    return (
      <div className="form-item-select s">
        <span className="form-item-select-label">{t('Apply.Trading')}</span>
        <div className="form-item-select-right">{innerContent}</div>
      </div>
    )
  }, [t, innerContent])

  // useEffect(() => {
  //   if (tradingList.length) {
  //     const _ = [tradingList[0]?.token]
  //     onChange(_)
  //     setSelected(_)
  //   }
  // }, [tradingList])

  return (
    <Select
      mode="multiple"
      // value={selected}
      disabled={tradingList.loaded || isEmpty(tradingList.list)}
      onChange={(v) => {
        onChange(v)
        setSelected(v)
      }}
      triggerElement={triggerElement}
      onVisibleChange={setVisible}
      notFoundContent={<small className="search-null">{t('Apply.NoData')}</small>}
    >
      {tradingList.list.map((l) => (
        <Option className="option" key={l.token} value={l.token}>
          <Image src={l.logo} />
          <span>{l.symbol}</span>
        </Option>
      ))}
    </Select>
  )
}

export default TokenOptions
