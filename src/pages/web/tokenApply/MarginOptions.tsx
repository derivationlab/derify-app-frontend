import { Input, Select } from '@arco-design/web-react'
import { IconSearch } from '@arco-design/web-react/icon'
import classNames from 'classnames'
import { searchMarginToken } from 'derify-apis-staging'
import { debounce, uniqBy, isEmpty } from 'lodash-es'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import Image from '@/components/common/Image'
import Spinner from '@/components/common/Spinner'
import { MARGIN_VISIBLE_COUNT } from '@/config'
import { getMarginDeployStatus, getMarginTokenList, useMarginTokenListStore } from '@/store'
import { Rec } from '@/typings'

let once = false
let seqCount = 0
let temporaryStorage: any[] = []
const Option = Select.Option

interface MarginOptions {
  data: Rec[]
  loaded: boolean
}

const MarginOptions = ({ onChange }: { onChange: (p: string) => void }) => {
  const { t } = useTranslation()
  const [visible, setVisible] = useBoolean(false)
  const [loadMore, setLoadMore] = useState<{ loaded: boolean; noData: boolean }>({ loaded: false, noData: false })
  const [selected, setSelected] = useState<string>()
  const [mrOption, setMrOption] = useState<MarginOptions>({ data: [], loaded: false })
  const [keywords, setKeywords] = useState<string>('')

  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenListForApply)

  const triggerElement = useMemo(() => {
    const target = mrOption.data.find((l) => l.margin_token === selected)
    return (
      <div className="form-item-select s">
        <span className="form-item-select-label">{t('Apply.Margin')}</span>
        <div className="form-item-select-right">
          {target && (
            <>
              <Image src={target?.logo} className="token-icon" />
              <span className={classNames({ active: visible })}>{target?.symbol}</span>
              <em className={classNames('arrow', { active: visible })} />
            </>
          )}
          {!target && <small className="null">{t('Apply.NoData')}</small>}
        </div>
      </div>
    )
  }, [t, selected, visible])

  const fuzzySearchFunc = useCallback(
    debounce(async (searchKeyword: string) => {
      const { data = [] } = await searchMarginToken<{ data: any[] }>(searchKeyword)
      const deployStatus = await getMarginDeployStatus(data)
      const filter = data.filter((f: Rec) => deployStatus[f.symbol] && f.advisor && f.open)
      // const filter = data.filter((f: Rec) => deployStatus[f.symbol] && f.open)
      setMrOption({ data: filter, loaded: false })
    }, 100),
    []
  )

  /**
   * FIXME:
   * The margin data is not suitable for paging.
   * There are too many filtering conditions and there is no basis for judgment.
   */
  const getMarginData = useCallback(async () => {
    const { records = [] } = await getMarginTokenList(seqCount)
    const deployStatus = await getMarginDeployStatus(records)
    const filter = records.filter((f: Rec) => deployStatus[f.symbol] && f.advisor && f.open)
    // const filter = records.filter((f: Rec) => deployStatus[f.symbol] && f.open)
    const combine = [...mrOption.data, ...filter]
    const deduplication = uniqBy(combine, 'margin_token')
    temporaryStorage = deduplication
    setMrOption((val: any) => ({ ...val, data: deduplication, loaded: false }))
    if (records.length === 0 || records.length < MARGIN_VISIBLE_COUNT) seqCount = seqCount - 1
    setLoadMore(() => ({ noData: filter < MARGIN_VISIBLE_COUNT, loaded: false }))
  }, [mrOption.data])

  const getMoreMargin = () => {
    setLoadMore((val) => ({ ...val, loaded: true }))
    seqCount += 1
    void getMarginData()
  }

  useEffect(() => {
    if (!visible) {
      const data = temporaryStorage.length === 0 ? marginTokenList : temporaryStorage
      setMrOption({ data, loaded: false })
    }
  }, [visible, marginTokenList])

  useEffect(() => {
    if (keywords.trim()) {
      setMrOption({ data: [], loaded: true })
      void fuzzySearchFunc(keywords)
    } else {
      const data = temporaryStorage.length === 0 ? marginTokenList : temporaryStorage
      setMrOption({ data, loaded: false })
    }
  }, [keywords, marginTokenList])

  // Only initialize once
  useEffect(() => {
    if (mrOption.data.length && !once) {
      const _ = mrOption.data[0]?.margin_token
      onChange(_)
      setSelected(_)
      once = true
    }
  }, [mrOption])

  /**
   * FIXME:
   * If the search function is supported,
   * do not use a variable to manage the search results and original data.
   * @effect:
   * 1. Select --> disabled
   * 2. mrOption.data
   */
  return (
    <Select
      onChange={(v) => {
        onChange(v)
        setSelected(v)
      }}
      disabled={isEmpty(mrOption.data)}
      triggerElement={triggerElement}
      onVisibleChange={setVisible}
      notFoundContent={<small className="search-null">{t('Apply.NoData')}</small>}
      dropdownRender={(options) => {
        return (
          <div>
            {/*<Input*/}
            {/*  className="search"*/}
            {/*  prefix={<IconSearch />}*/}
            {/*  onChange={setKeywords}*/}
            {/*  placeholder={t('Apply.SearchTip')}*/}
            {/*/>*/}
            {!mrOption.loaded && options}
            {mrOption.loaded && (
              <div className="search-loading">
                <Spinner mini />
              </div>
            )}
          </div>
        )
      }}
    >
      {mrOption.data.map((l) => (
        <Option className="option" key={l.margin_token} value={l.margin_token}>
          <Image src={l.logo} />
          <span>{l.symbol}</span>
        </Option>
      ))}
      {mrOption.data.length === MARGIN_VISIBLE_COUNT && !loadMore.noData && !keywords.trim() && (
        <button className="load-more" onClick={getMoreMargin} disabled={loadMore.loaded}>
          {t('Apply.LoadMore')}
          {loadMore.loaded && <Spinner mini />}
        </button>
      )}
    </Select>
  )
}

export default MarginOptions
