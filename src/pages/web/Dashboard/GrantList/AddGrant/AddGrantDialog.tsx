import dayjs from 'dayjs'
import React, { FC, useState, useMemo, useReducer } from 'react'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import AmountInput from '@/components/common/Wallet/AmountInput'
import { Select, Input } from '@/components/common/Form'

import { useConfigInfo, useTokenBalances } from '@/zustand'
import { grantTargetOptions, reducer, stateInit } from '@/reducers/addGrant'
import { DEFAULT_MARGIN_TOKEN, findToken, MARGIN_TOKENS, PLATFORM_TOKEN } from '@/config/tokens'
import { isET, isLT, keepDecimals, safeInterceptionValues } from '@/utils/tools'

interface Props {
  visible: boolean
  onClose: () => void
  onConfirm: (token: string, type: string, amount: string, days1: number, days2: number) => void
}

const limitDays = {
  grantDays: [1, 9000],
  cliffDays: [0, 3650]
}

const targetOptions = grantTargetOptions()

const AddGrantDialog: FC<Props> = ({ visible, onClose, onConfirm }) => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const [toggle, setToggle] = useState<boolean>(false)

  const balances = useTokenBalances((state) => state.balances)
  const minimumGrant = useConfigInfo((state) => state.minimumGrant)

  const disabled = useMemo(() => {
    const p1 = minimumGrant[state.grantTarget as any]
    const p2 = balances[PLATFORM_TOKEN.symbol]
    if (isET(p2, 0) || isET(p1, 0)) return true
    if (isLT(p2, p1)) return true
    if (isLT(state.amountInp || 0, p1)) return true
    if (state.grantDays < limitDays.grantDays[0] || state.grantDays > limitDays.grantDays[1]) return true
    if (state.cliffDays < limitDays.cliffDays[0] || state.cliffDays > limitDays.cliffDays[1]) return true
  }, [balances, minimumGrant, state.amountInp, state.grantDays, state.cliffDays, state.grantTarget])

  const periodDate = useMemo(() => {
    const format = 'MM/DD/YYYY HH:mm:ss'
    const start = state.cliffDays * 86400000
    const end = (Number(state.grantDays) + Number(state.cliffDays)) * 86400000
    return [dayjs().add(start).utc().format(format), dayjs().add(end).utc().format(format)]
  }, [state.grantDays, state.cliffDays])

  const marginOptions = useMemo(
    () =>
      MARGIN_TOKENS.map((t) => ({
        value: t.symbol,
        label: t.symbol,
        icon: `market/${t.symbol.toLowerCase()}.svg`
      })),
    []
  )

  const currentMargin = useMemo(
    () => marginOptions.find((item: any) => item.value === state.marginToken) ?? marginOptions[0],
    [state.marginToken, marginOptions]
  )

  const currentTarget = useMemo(
    () => grantTargetOptions().find((item: any) => item.value === state.grantTarget),
    [state.grantTarget]
  )

  const clearState = () => {
    setToggle(false)
    dispatch({ type: 'SET_AMOUNT_INP', payload: '' })
    dispatch({ type: 'SET_GRANT_DAYS', payload: 1 })
    dispatch({ type: 'SET_CLIFF_DAYS', payload: 0 })
    dispatch({ type: 'SET_MARGIN_TOKEN', payload: DEFAULT_MARGIN_TOKEN.symbol })
    dispatch({ type: 'SET_GRANT_TARGET', payload: grantTargetOptions()[0].value })
  }

  const _onConfirm = () => {
    onConfirm(state.marginToken, currentTarget?.key, state.amountInp, state.grantDays, state.cliffDays)
  }

  return (
    <Dialog
      width="540px"
      visible={visible}
      title={toggle ? 'Add Grant' : 'Grant Info'}
      onClose={() => {
        clearState()
        onClose()
      }}
    >
      {!toggle ? (
        <>
          <div className="web-dashboard-add-grant-dialog">
            <div className="web-dashboard-add-grant-dialog-selects">
              <Select
                filter
                label="Margin"
                value={state.marginToken}
                onChange={(v) => dispatch({ type: 'SET_MARGIN_TOKEN', payload: v })}
                renderer={(item) => (
                  <div className="web-select-options-item">
                    {item.icon && <Image src={item.icon} />}
                    {item.label}
                  </div>
                )}
                objOptions={marginOptions}
                labelRenderer={(item) => (
                  <div className="web-dashboard-add-grant-margin-label">
                    {item.icon && <Image src={item.icon} />}
                    <span>{item.label}</span>
                  </div>
                )}
                filterPlaceholder="Search name or contract address..."
              />
              <hr />
              <Select
                label="Target"
                value={state.grantTarget}
                onChange={(v) => dispatch({ type: 'SET_GRANT_TARGET', payload: v })}
                objOptions={targetOptions as any}
              />
            </div>
            <div className="web-dashboard-add-grant-dialog-volume">
              <p>
                Max:{' '}
                <em>
                  {keepDecimals(balances[PLATFORM_TOKEN.symbol], findToken(PLATFORM_TOKEN.symbol).decimals, true)}
                </em>{' '}
                {PLATFORM_TOKEN.symbol}
              </p>
              <AmountInput
                max={safeInterceptionValues(balances[PLATFORM_TOKEN.symbol], findToken(PLATFORM_TOKEN.symbol).decimals)}
                unit={PLATFORM_TOKEN.symbol}
                title="Volume"
                initial={minimumGrant[state.grantTarget as any]}
                onChange={(v) => dispatch({ type: 'SET_AMOUNT_INP', payload: v })}
              />
            </div>
            <div className="web-dashboard-add-grant-dialog-days">
              <section>
                <label>Grant Days ({`${limitDays.grantDays[0]} - ${limitDays.grantDays[1]}`})</label>
                <Input
                  type="number"
                  value={state.grantDays}
                  suffix="Days"
                  onChange={(v) => dispatch({ type: 'SET_GRANT_DAYS', payload: v })}
                />
              </section>
              <section>
                <label>Cliff Days ({`${limitDays.cliffDays[0]} - ${limitDays.cliffDays[1]}`})</label>
                <Input
                  type="number"
                  value={state.cliffDays}
                  suffix="Days"
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
            Add Grant
          </Button>
        </>
      ) : (
        <>
          <div className="web-dashboard-add-grant-dialog-preview">
            <dl>
              <dt>Margin</dt>
              <dd>
                <Image src={currentMargin.icon} />
                {currentMargin.label}
              </dd>
            </dl>
            <dl>
              <dt>Target</dt>
              <dd>{currentTarget?.label}</dd>
            </dl>
            <dl>
              <dt>Rewards</dt>
              <dd>
                {keepDecimals(state.amountInp, findToken(PLATFORM_TOKEN.symbol).decimals, true)} {PLATFORM_TOKEN.symbol}
              </dd>
            </dl>
            <dl>
              <dt>Start</dt>
              <dd>{periodDate[0]} UTC</dd>
            </dl>
            <dl>
              <dt>End</dt>
              <dd>{periodDate[1]} UTC</dd>
            </dl>
          </div>
          <Button
            className="web-dashboard-add-grant-dialog-confirm"
            onClick={() => {
              clearState()
              _onConfirm()
            }}
          >
            Confirm
          </Button>
        </>
      )}
    </Dialog>
  )
}

export default AddGrantDialog
