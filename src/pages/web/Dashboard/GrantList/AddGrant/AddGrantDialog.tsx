import dayjs from 'dayjs'

import React, { FC, useState, useMemo, useReducer, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import Input from '@/components/common/Form/Input'
import Select from '@/components/common/Form/Select'
import Image from '@/components/common/Image'
import Skeleton from '@/components/common/Skeleton'
import AmountInput from '@/components/common/Wallet/AmountInput'
import { PLATFORM_TOKEN } from '@/config/tokens'
import { useMinimumGrant } from '@/hooks/useMinimumGrant'
import { resortMargin } from '@/pages/web/Dashboard/Overview/MarketInfo'
import { grantTargetOptions, reducer, stateInit } from '@/reducers/addGrant'
import { getMarginDeployStatus, getMarginTokenList, useBalancesStore, useProtocolConfigStore } from '@/store'
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

interface IPagination {
  data: any[]
  index: number
}

const AddGrantDialog: FC<Props> = ({ visible, onClose, onConfirm }) => {
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(reducer, stateInit)
  const [toggle, setToggle] = useState<boolean>(false)
  const [pagination, setPagination] = useState<IPagination>({ data: [], index: 0 })

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

  const options = useMemo(() => {
    if (pagination.data.length) {
      return pagination.data
        .map((token) => {
          if (token.open > 0)
            return {
              value: token.margin_token,
              label: token.symbol,
              icon: token.logo
            }
        })
        .filter((token) => token)
    }

    return []
  }, [pagination.data])

  const disabled = useMemo(() => {
    const amount = minimumGrant[state.grantTarget as GrantKeys]
    const balance = balances?.[PLATFORM_TOKEN.symbol] ?? 0
    if (options.length === 0) return true
    if (isET(balance, 0) || isET(amount, 0)) return true
    if (isLT(balance, amount)) return true
    if (isLT(state.amountInp || 0, amount)) return true
    if (state.grantDays < limitDays.grantDays[0] || state.grantDays > limitDays.grantDays[1]) return true
    if (state.cliffDays < limitDays.cliffDays[0] || state.cliffDays > limitDays.cliffDays[1]) return true
  }, [options, balances, minimumGrant, state.amountInp, state.grantDays, state.cliffDays, state.grantTarget])

  const currentMargin = useMemo(
    () => options.find((item: any) => item.value === state.marginToken) ?? options[0],
    [state.marginToken, options]
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

  const _getMarginTokenList = async () => {
    const data = await getMarginTokenList(pagination.index)
    if (data && data.records.length) {
      const _data = data.records
      const deployStatus = await getMarginDeployStatus(_data)
      const filter = _data.filter((f: Rec) => deployStatus[f.symbol])
      setPagination((val) => {
        return { ...val, data: resortMargin([...val.data, ...filter]) }
      })
    }
  }

  useEffect(() => {
    if (marginTokenList.length) {
      dispatch({ type: 'SET_MARGIN_TOKEN', payload: marginTokenList[0].margin_token })
      setPagination((val) => ({ ...val, data: resortMargin(marginTokenList) }))
    }
  }, [marginTokenList])

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].intersectionRatio <= 0) return
        setPagination((val) => ({ ...val, index: ++pagination.index }))
      },
      { threshold: 0 }
    )

    const parent = document.getElementById('MARGIN')
    const children = parent?.querySelectorAll('.web-select-options-li')
    const target = children?.[children.length - 1]
    if (target) intersectionObserver.observe(target)
  }, [options])

  useEffect(() => {
    if (pagination.index > 0) {
      void _getMarginTokenList()
    }
  }, [pagination.index])

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
              <div id="MARGIN" className="web-dashboard-add-grant-dialog-label">
                <label>{t('NewDashboard.GrantList.Margin')}</label>
                <Skeleton rowsProps={{ rows: 1 }} animation loading={options.length === 0}>
                  <Select
                    filter
                    value={state.marginToken}
                    onChange={(v) => dispatch({ type: 'SET_MARGIN_TOKEN', payload: v })}
                    renderer={(item) => (
                      <div className="web-select-options-item">
                        <Image src={item.icon} />
                        {item.label}
                      </div>
                    )}
                    objOptions={options as any}
                    labelRenderer={(item) => (
                      <div className="web-dashboard-add-grant-margin-label">
                        <Image src={item.icon} />
                        <span>{item.label}</span>
                      </div>
                    )}
                    filterPlaceholder="Search name or contract address..."
                  />
                </Skeleton>
              </div>
              <hr />
              <Select
                label={t('NewDashboard.GrantList.Target', 'Target')}
                value={state.grantTarget}
                onChange={(v) => dispatch({ type: 'SET_GRANT_TARGET', payload: v })}
                objOptions={grantTarget as any}
                className="relative"
              />
            </div>
            <div className="web-dashboard-add-grant-dialog-volume">
              <p>
                Max: <em>{keepDecimals(balances?.[PLATFORM_TOKEN.symbol] ?? 0, 2)}</em> {PLATFORM_TOKEN.symbol}
              </p>
              <AmountInput
                max={nonBigNumberInterception(balances?.[PLATFORM_TOKEN.symbol] ?? 0, 2)}
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
                <Image src={currentMargin?.icon} />
                {currentMargin?.label}
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
