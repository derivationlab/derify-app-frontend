import { getDerivativeList, getSystemParams } from 'derify-apis-staging'
import { uniqBy } from 'lodash-es'
import Table from 'rc-table'

import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import { DropDownList, DropDownListItem } from '@/components/common/DropDownList'
import { TRADING_VISIBLE_COUNT } from '@/config'
import { useClearingParams } from '@/hooks/useClearingParams'
import { useDerivativeParams } from '@/hooks/useDerivativeParams'
import { useRewardsParams, useProtocolParams, useExchangeParams, useGrantPlanParams } from '@/hooks/useSysParams'
import { useDerivativeListStore, useMarginTokenStore, useProtocolConfigStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { Rec } from '@/typings'
import { bnMul, nonBigNumberInterception } from '@/utils/tools'

const systemParamsInit = {
  buybackPeriod: 0,
  buybackSlippage: '0'
}

interface PairOptionsInit {
  data: Rec[]
  loaded: boolean
}

let seqCount = 0

const System: FC = () => {
  const bottomRef = useRef<any>()
  const observerRef = useRef<IntersectionObserver | null>()
  const { t } = useTranslation()

  const [parameters, setParameters] = useState<typeof systemParamsInit>(systemParamsInit)
  const [derivative, setDerivative] = useState<Rec>()
  const [pairOptions, setPairOptions] = useState<PairOptionsInit>({ data: [], loaded: false })
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)
  const { data: protocolParams } = useProtocolParams()
  const { clearingParams } = useClearingParams(protocolConfig?.clearing)
  const { derivativeParams } = useDerivativeParams(derivative?.derivative ?? '')
  const { data: rewardsParams, refetch: refetchRewardsParams } = useRewardsParams(protocolConfig?.rewards)
  const { data: exchangeParams, refetch: refetchExchangeParams } = useExchangeParams(protocolConfig?.exchange)
  const { data: grantPlanParams, refetch: refetchGrantPlanParams } = useGrantPlanParams(protocolConfig)

  const system = useMemo(() => {
    return [
      {
        parameters: t('Nav.SystemParameters.OpenClosePositionLimit'),
        value: nonBigNumberInterception(exchangeParams.thetaRatio, 8)
      },
      {
        parameters: t('Nav.SystemParameters.BuybackFundRatio'),
        value: `${nonBigNumberInterception(bnMul(exchangeParams.buyBackFundRatio, 100), 4)}%`
      },
      {
        parameters: t('Nav.SystemParameters.MinPositionValue'),
        value: nonBigNumberInterception(exchangeParams.minOpenAmount, 8)
      },
      {
        parameters: t('Nav.SystemParameters.MMRMaintenanceMarginRatio'),
        value: `${nonBigNumberInterception(bnMul(clearingParams.marginMaintenanceRatio, 100), 4)}%`
      },
      {
        parameters: t('Nav.SystemParameters.LMRLiquidationMarginRatio'),
        value: `${nonBigNumberInterception(bnMul(clearingParams.marginLiquidationRatio, 100), 4)}%`
      },
      {
        parameters: t('Nav.SystemParameters.MultiplierofMMRAfterADL'),
        value: nonBigNumberInterception(clearingParams.marginMaintenanceRatioMultiple, 8)
      },
      {
        parameters: t('Nav.SystemParameters.iAPRofbToken'),
        value: `${nonBigNumberInterception(bnMul(rewardsParams.bondAnnualInterestRate, 100), 4)}%`
      },
      {
        parameters: t('Nav.SystemParameters.eDRFMintperblock'),
        value: nonBigNumberInterception(protocolParams.unitStakingNumber, 8)
      },
      {
        parameters: t('Nav.SystemParameters.BrokerPrivilegeFeeeDRF'),
        value: nonBigNumberInterception(protocolParams.brokerApplyNumber, 8)
      },
      {
        parameters: t('Nav.SystemParameters.eDRFforbrokerprivilegeperblock'),
        value: nonBigNumberInterception(protocolParams.brokerValidUnitNumber, 8)
      },
      {
        parameters: t('Nav.SystemParameters.MultiplierofGasFee'),
        value: nonBigNumberInterception(clearingParams.gasFeeRewardRatio, 8)
      },
      {
        parameters: t('Nav.SystemParameters.Buybackcycleblocks'),
        value: nonBigNumberInterception(parameters.buybackPeriod, 8)
      },
      {
        parameters: t('Nav.SystemParameters.BuybackSlippageTolerance'),
        value: `${bnMul(parameters.buybackSlippage, 100)}%`
      },
      {
        parameters: t('Nav.SystemParameters.MinGrantDRFspositionmining'),
        value: nonBigNumberInterception(grantPlanParams.mining, 8)
      },
      {
        parameters: t('Nav.SystemParameters.MinGrantDRFsbroker'),
        value: nonBigNumberInterception(grantPlanParams.awards, 8)
      },
      {
        parameters: t('Nav.SystemParameters.MinGrantDRFstradingcompetition'),
        value: nonBigNumberInterception(grantPlanParams.rank, 8)
      }
    ]
  }, [parameters, exchangeParams, clearingParams, grantPlanParams, protocolParams])

  const trading = useMemo(() => {
    return [
      { parameters: t('Nav.SystemParameters.kPCFRate'), value: nonBigNumberInterception(derivativeParams.kRatio, 8) },
      { parameters: t('Nav.SystemParameters.yPCFRate'), value: nonBigNumberInterception(derivativeParams.gRatio, 8) },
      {
        parameters: t('Nav.SystemParameters.PCF'),
        value: `${nonBigNumberInterception(bnMul(derivativeParams.roRatio, 100), 4)}%`
      },
      {
        parameters: t('Nav.SystemParameters.TradingFeeRatio'),
        value: `${nonBigNumberInterception(bnMul(derivativeParams.tradingFeeRatio, 100), 4)}%`
      },
      { parameters: t('Nav.SystemParameters.Maxlimitorders'), value: derivativeParams.maxLimitOrderSize },
      {
        parameters: t('Nav.SystemParameters.Maxleverage'),
        value: nonBigNumberInterception(derivativeParams.maxLeverage, 0)
      }
    ]
  }, [t, derivativeParams])

  const columns = [
    {
      title: t('Nav.SystemParameters.Parameters'),
      dataIndex: 'parameters',
      width: '60%'
    },
    {
      title: t('Nav.SystemParameters.Value'),
      dataIndex: 'value'
    }
  ]

  const morePairs = useCallback(async () => {
    const { data } = await getDerivativeList<{ data: Rec }>(marginToken.address, seqCount)
    if (protocolConfig && data?.records) {
      const filter = data.records.filter((r: Rec) => r.open)
      const combine = [...pairOptions.data, ...filter]
      const deduplication = uniqBy(combine, 'token')
      setPairOptions((val: any) => ({ ...val, data: deduplication, loaded: false }))
      if (data.records.length === 0 || data.records.length < TRADING_VISIBLE_COUNT) seqCount = seqCount - 1
    }
  }, [protocolConfig, pairOptions.data])

  useEffect(() => {
    if (pairOptions.data.length) {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.id === 'bottom') {
              seqCount += 1
              void morePairs()
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
  }, [pairOptions.data.length])

  useEffect(() => {
    const func = async () => {
      const { data } = await getSystemParams<{ data: Rec }>(marginToken.address)
      setParameters({
        buybackPeriod: data.buyback_period,
        buybackSlippage: data.buyback_sllipage
      })
    }

    void func()
  }, [marginToken])

  useEffect(() => {
    if (protocolConfig) {
      void refetchRewardsParams()
      void refetchExchangeParams()
      void refetchGrantPlanParams()
    }
  }, [protocolConfig])

  useEffect(() => {
    if (derivativeList.length) {
      setDerivative(derivativeList[0])
      setPairOptions({ data: derivativeList, loaded: false })
    }
  }, [derivativeList])

  return (
    <div className="web-table-page">
      <div className="web-system-title">
        {t('Nav.SystemParameters.SystemParameters')}-{marginToken.symbol}
      </div>
      <header className="web-table-page-header">
        <h3>{t('Nav.SystemParameters.SystemRelevant')}</h3>
      </header>
      <Table className="web-broker-table" columns={columns} data={system} rowKey="parameters" />
      <header className="web-table-page-header">
        <h3>{t('Nav.SystemParameters.TradingToken')}</h3>
        <aside className="web-system-pair">
          <DropDownList
            entry={
              <div className="web-select-show-button">
                <span>{derivative?.name}</span>
              </div>
            }
            height={isMobile ? 244 : 284}
            loading={pairOptions.loaded}
            showSearch={false}
          >
            {pairOptions.data.map((o: Rec, index: number) => {
              const len = pairOptions.data.length
              const id = index === len - 1 ? 'bottom' : undefined
              const ref = index === len - 1 ? bottomRef : null
              return (
                <DropDownListItem
                  key={o.name}
                  id={id}
                  ref={ref}
                  content={o.name}
                  onSelect={() => {
                    setDerivative(o)
                  }}
                />
              )
            })}
          </DropDownList>
        </aside>
      </header>
      <Table className="web-broker-table" columns={columns} data={trading} rowKey="parameters" />
    </div>
  )
}

export default System
