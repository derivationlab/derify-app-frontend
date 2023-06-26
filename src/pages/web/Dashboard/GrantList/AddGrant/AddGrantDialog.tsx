import classNames from 'classnames'
import dayjs from 'dayjs'
import { debounce, uniqBy } from 'lodash'
import { useAccount } from 'wagmi'

import React, { FC, useState, useMemo, useReducer, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import { searchMarginToken } from '@/api'
import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import { DropDownList, DropDownListItem } from '@/components/common/DropDownList'
import Input from '@/components/common/Form/Input'
import Select from '@/components/common/Form/Select'
import Image from '@/components/common/Image'
import Skeleton from '@/components/common/Skeleton'
import AmountInput from '@/components/common/Wallet/AmountInput'
import { PLATFORM_TOKEN } from '@/config/tokens'
import { useMarginBalances } from '@/hooks/useMarginBalances'
import { useMinimumGrant } from '@/hooks/useMinimumGrant'
import { resortMargin } from '@/pages/web/Dashboard/Overview/MarketInfo'
import { grantTargetOptions, reducer, stateInit } from '@/reducers/addGrant'
import {
  getMarginDeployStatus,
  getMarginTokenList,
  useBalancesStore,
  useMarginTokenStore,
  useProtocolConfigStore
} from '@/store'
import { MarginTokenState } from '@/store/types'
import { useMarginTokenListStore } from '@/store/useMarginTokenList'
import { GrantKeys, Rec } from '@/typings'
import { isET, isLT, keepDecimals, nonBigNumberInterception } from '@/utils/tools'

interface Props {
  visible: boolean
  onClose: () => void
  onConfirm: (token: string, type: string, amount: string, days1: number, days2: number) => void
}

const limitDays = {
  grantDays: [1, 9000],
  cliffDays: [0, 3650]
}

const grantTarget = grantTargetOptions()

let seqCount = 0

const AddGrantDialog: FC<Props> = ({ visible, onClose, onConfirm }) => {
  const bottomRef = useRef<any>()
  const observerRef = useRef<IntersectionObserver | null>()
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(reducer, stateInit)
  const [toggle, setToggle] = useState<boolean>(false)
  const [marginOptions, setMarginOptions] = useState<{ data: Rec[]; loaded: boolean }>({
    data: [],
    loaded: false
  })
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const balances = useBalancesStore((state) => state.balances)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const { minimumGrant } = useMinimumGrant(protocolConfig)

  const periodDate = useMemo(() => {
    const format = 'MM/DD/YYYY HH:mm:ss'
    const start = state.cliffDays * 86400000
    const end = (Number(state.grantDays) + Number(state.cliffDays)) * 86400000
    return [dayjs().add(start).format(format), dayjs().add(end).format(format)]
  }, [state.grantDays, state.cliffDays])

  const disabled = useMemo(() => {
    const amount = minimumGrant[state.grantTarget as GrantKeys]
    const balance = balances?.[PLATFORM_TOKEN.symbol] ?? 0
    if (marginOptions.data.length === 0) return true
    if (isET(balance, 0) || isET(amount, 0)) return true
    if (isLT(balance, amount)) return true
    if (isLT(state.amountInp || 0, amount)) return true
    if (state.grantDays < limitDays.grantDays[0] || state.grantDays > limitDays.grantDays[1]) return true
    if (state.cliffDays < limitDays.cliffDays[0] || state.cliffDays > limitDays.cliffDays[1]) return true
  }, [marginOptions.data, balances, minimumGrant, state.amountInp, state.grantDays, state.cliffDays, state.grantTarget])

  const currentMargin = useMemo(
    () => marginOptions.data.find((item: Rec) => item.margin_token === state.marginToken) ?? marginOptions.data[0],
    [state.marginToken, marginOptions.data]
  )

  const currentTarget = useMemo(
    () => grantTarget.find((item: any) => item.value === state.grantTarget) ?? grantTarget[0],
    [state.grantTarget]
  )

  const clearSetState = () => {
    setToggle(false)
    dispatch({ type: 'SET_AMOUNT_INP', payload: '' })
    dispatch({ type: 'SET_GRANT_DAYS', payload: 1 })
    dispatch({ type: 'SET_CLIFF_DAYS', payload: 0 })
    dispatch({ type: 'SET_GRANT_TARGET', payload: grantTarget[0].value })
    dispatch({ type: 'SET_MARGIN_TOKEN', payload: marginTokenList[0].margin_token })
  }

  const addGrantConfirm = () => {
    onConfirm(state.marginToken, currentTarget?.value, state.amountInp, state.grantDays, state.cliffDays)
  }

  const _searchMarginToken = useCallback(
    debounce(async (searchKeyword: string) => {
      const { data = [] } = await searchMarginToken(searchKeyword)
      setMarginOptions({ data, loaded: false })
    }, 1500),
    []
  )

  const funcAsync = useCallback(async () => {
    const { records = [] } = await getMarginTokenList(seqCount)
    const deployStatus = await getMarginDeployStatus(records)
    const filter = records.filter((f: Rec) => deployStatus[f.symbol] && f.open)
    const combine = [...marginOptions.data, ...filter]
    const deduplication = uniqBy(combine, 'margin_token')
    setMarginOptions((val: any) => ({ ...val, data: deduplication, loaded: false }))
    if (records.length === 0 || records.length < 30) seqCount = seqCount - 1
  }, [marginOptions.data])

  useEffect(() => {
    if (searchKeyword.trim()) {
      setMarginOptions({ data: [], loaded: true })
      void _searchMarginToken(searchKeyword)
    } else {
      seqCount = 0
      if (marginTokenList.length) {
        const output: Rec[] = []
        marginTokenList.forEach((margin) => {
          if (margin.open > 0) output.push(margin)
        })
        dispatch({ type: 'SET_MARGIN_TOKEN', payload: output[0].margin_token })
        setMarginOptions({ data: resortMargin(output), loaded: false })
      }
    }
  }, [searchKeyword, marginTokenList])

  useEffect(() => {
    if (marginOptions.data.length) {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.id === 'bottom') {
              seqCount += 1
              console.info('intersectionObserver=', seqCount)
              void funcAsync()
            }
          })
        },
        { threshold: 0.2 }
      )
      if (bottomRef.current) {
        intersectionObserver.observe(bottomRef.current)
        observerRef.current = intersectionObserver
      }
    }
    return () => {
      observerRef.current && observerRef.current.disconnect()
    }
  }, [marginOptions.data.length])

  return (
    <Dialog
      width="540px"
      title={t(`NewDashboard.GrantList.${toggle ? 'AddGrant' : 'GrantInfo'}`)}
      visible={visible}
      onClose={() => {
        onClose()
        clearSetState()
      }}
    >
      {!toggle ? (
        <>
          <div className="web-dashboard-add-grant-dialog">
            <div className="web-dashboard-add-grant-dialog-selects">
              <DropDownList
                entry={
                  <div className="web-dashboard-add-grant-select-entry">
                    <label>{t('NewDashboard.GrantList.Margin')}</label>
                    <section>
                      <Image src={currentMargin?.logo} />
                      <strong>{currentMargin?.symbol}</strong>
                    </section>
                  </div>
                }
                loading={marginOptions.loaded}
                onSearch={setSearchKeyword}
                placeholder="Search name or contract address..."
              >
                {marginOptions.data.map((o: any, index: number) => {
                  const len = marginOptions.data.length
                  const id = index === len - 1 ? 'bottom' : undefined
                  const ref = index === len - 1 ? bottomRef : null
                  const _id = searchKeyword.trim() ? undefined : id
                  const _ref = searchKeyword.trim() ? null : ref
                  return (
                    <DropDownListItem
                      key={o.margin_token}
                      id={_id}
                      ref={_ref}
                      content={
                        <>
                          <Image src={o.logo} style={{ width: '24px' }} />
                          {o.symbol}
                        </>
                      }
                      onSelect={() => dispatch({ type: 'SET_MARGIN_TOKEN', payload: o.margin_token })}
                      className={classNames('web-dashboard-add-grant-margin-item', {
                        active: state.marginToken === o.margin_token,
                        close: !o.open
                      })}
                    />
                  )
                })}
              </DropDownList>
              <DropDownList
                entry={
                  <div className="web-dashboard-add-grant-select-entry n">
                    <label>{t('NewDashboard.GrantList.Target')}</label>
                    <section>
                      <strong>{currentTarget?.label}</strong>
                    </section>
                  </div>
                }
                showSearch={false}
              >
                {grantTarget.map((o: any) => {
                  return (
                    <DropDownListItem
                      key={o.value}
                      content={o.label}
                      onSelect={() => dispatch({ type: 'SET_GRANT_TARGET', payload: o.value })}
                      className={classNames('web-dashboard-add-grant-target-item', {
                        active: state.grantTarget === o.value
                      })}
                    />
                  )
                })}
              </DropDownList>
            </div>
            <div className="web-dashboard-add-grant-dialog-volume">
              <p>
                Max: <em>{keepDecimals(balances?.[PLATFORM_TOKEN.symbol] ?? 0, 2)}</em> {PLATFORM_TOKEN.symbol}
              </p>
              <AmountInput
                max={keepDecimals(
                  balances?.[PLATFORM_TOKEN.symbol] ?? 0,
                  Number(balances?.[PLATFORM_TOKEN.symbol] ?? 0) === 0 ? 2 : 2
                )}
                unit={PLATFORM_TOKEN.symbol}
                title={t('NewDashboard.GrantList.Volume', 'Volume')}
                initial={nonBigNumberInterception(minimumGrant[state.grantTarget as GrantKeys])}
                onChange={(v) => dispatch({ type: 'SET_AMOUNT_INP', payload: v })}
              />
            </div>
            <div className="web-dashboard-add-grant-dialog-days">
              <section>
                <label>
                  {t('NewDashboard.GrantList.GrantDays', 'Grant Days')} (
                  {`${limitDays.grantDays[0]} - ${limitDays.grantDays[1]}`})
                </label>
                <Input
                  type="number"
                  value={state.grantDays}
                  suffix={t('NewDashboard.GrantList.Days', 'Days')}
                  onChange={(v) => dispatch({ type: 'SET_GRANT_DAYS', payload: v })}
                />
              </section>
              <section>
                <label>
                  {t('NewDashboard.GrantList.CliffDays', 'Cliff Days')} (
                  {`${limitDays.cliffDays[0]} - ${limitDays.cliffDays[1]}`})
                </label>
                <Input
                  type="number"
                  value={state.cliffDays}
                  suffix={t('NewDashboard.GrantList.Days', 'Days')}
                  onChange={(v) => dispatch({ type: 'SET_CLIFF_DAYS', payload: v })}
                />
              </section>
            </div>
          </div>
          <Button
            className="web-dashboard-add-grant-dialog-confirm"
            onClick={() => setToggle(true)}
            disabled={disabled}
          >
            {t('NewDashboard.GrantList.AddGrant', 'Add Grant')}
          </Button>
        </>
      ) : (
        <>
          <div className="web-dashboard-add-grant-dialog-preview">
            <dl>
              <dt>{t('NewDashboard.GrantList.Margin', 'Margin')}</dt>
              <dd>
                <Image src={currentMargin?.logo} />
                {currentMargin?.symbol}
              </dd>
            </dl>
            <dl>
              <dt>{t('NewDashboard.GrantList.Target', 'Target')}</dt>
              <dd>{currentTarget?.label}</dd>
            </dl>
            <dl>
              <dt>{t('NewDashboard.GrantList.Rewards', 'Rewards')}</dt>
              <dd>
                {keepDecimals(state.amountInp, 2, true)} {PLATFORM_TOKEN.symbol}
              </dd>
            </dl>
            <dl>
              <dt>{t('NewDashboard.GrantList.Start', 'Start')}</dt>
              <dd>{periodDate[0]}</dd>
            </dl>
            <dl>
              <dt>{t('NewDashboard.GrantList.End', 'End')}</dt>
              <dd>{periodDate[1]}</dd>
            </dl>
          </div>
          <Button
            className="web-dashboard-add-grant-dialog-confirm"
            onClick={() => {
              clearSetState()
              addGrantConfirm()
            }}
          >
            {t('NewDashboard.GrantList.Confirm', 'Confirm')}
          </Button>
        </>
      )}
    </Dialog>
  )
}

export default AddGrantDialog
