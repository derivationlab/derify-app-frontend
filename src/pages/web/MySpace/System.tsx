import Table from 'rc-table'

import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getSystemParams } from '@/api'
import Select from '@/components/common/Form/Select'
import { pairOptions } from '@/data'
import { useClearingParams } from '@/hooks/useClearingParams'
import {
  useRewardsParams,
  useProtocolParams,
  useExchangeParams,
  useGrantPlanParams,
  useTradePairParams
} from '@/hooks/useSysParams'
import { useDerivativeListStore, useMarginTokenStore, useProtocolConfigStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { bnMul, nonBigNumberInterception } from '@/utils/tools'

const systemParamsInit = {
  buybackPeriod: 0,
  buybackSlippage: '0'
}

const System: FC = () => {
  const { t } = useTranslation()

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const derAddressList = useDerivativeListStore((state) => state.derAddressList)
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)

  const [parameters, setParameters] = useState<typeof systemParamsInit>(systemParamsInit)
  const [derivative, setDerivative] = useState<string>(derivativeList[0]?.name)

  const { data: protocolParams } = useProtocolParams()
  const { clearingParams } = useClearingParams(protocolConfig?.clearing)
  const { data: rewardsParams, refetch: refetchRewardsParams } = useRewardsParams(protocolConfig?.rewards)
  const { data: exchangeParams, refetch: refetchExchangeParams } = useExchangeParams(protocolConfig?.exchange)
  const { data: grantPlanParams, refetch: refetchGrantPlanParams } = useGrantPlanParams(protocolConfig)
  const { data: tradePairParams, refetch: refetchTradePairParams } = useTradePairParams(derAddressList?.[derivative])

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
      { parameters: t('Nav.SystemParameters.kPCFRate'), value: nonBigNumberInterception(tradePairParams.kRatio, 8) },
      { parameters: t('Nav.SystemParameters.yPCFRate'), value: nonBigNumberInterception(tradePairParams.gRatio, 8) },
      {
        parameters: t('Nav.SystemParameters.PCF'),
        value: `${nonBigNumberInterception(bnMul(tradePairParams.roRatio, 100), 4)}%`
      },
      {
        parameters: t('Nav.SystemParameters.TradingFeeRatio'),
        value: `${nonBigNumberInterception(bnMul(tradePairParams.tradingFeeRatio, 100), 4)}%`
      },
      { parameters: t('Nav.SystemParameters.Maxlimitorders'), value: tradePairParams.maxLimitOrderSize },
      {
        parameters: t('Nav.SystemParameters.Maxleverage'),
        value: nonBigNumberInterception(tradePairParams.maxLeverage, 0)
      }
    ]
  }, [t, tradePairParams])

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

  useEffect(() => {
    const func = async () => {
      const { data } = await getSystemParams(marginToken.address)
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
    if (derAddressList) void refetchTradePairParams()
  }, [derivative, derAddressList])

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
        <aside>
          <Select value={derivative} objOptions={pairOptions} onChange={(v) => setDerivative(v as any)} />
        </aside>
      </header>
      <Table className="web-broker-table" columns={columns} data={trading} rowKey="parameters" />
    </div>
  )
}

export default System
