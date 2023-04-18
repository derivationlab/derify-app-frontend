import Table from 'rc-table'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect, useMemo } from 'react'

import { findToken } from '@/config/tokens'
import { useMarginTokenStore } from '@/store'
import { useProtocolConf } from '@/hooks/useMatchConf'
import { bnMul, nonBigNumberInterception } from '@/utils/tools'
import {
  useBuyBackParams,
  useRewardsParams,
  useProtocolParams,
  useClearingParams,
  useExchangeParams,
  useGrantPlanParams
} from '@/hooks/useSysParams'

const System: FC = () => {
  const { t } = useTranslation()

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const { protocolConfig } = useProtocolConf(marginToken)
  const { data: buyBackParams } = useBuyBackParams(findToken(marginToken).tokenAddress)
  const { data: protocolParams } = useProtocolParams()
  const { data: rewardsParams, refetch: refetchRewardsParams } = useRewardsParams(protocolConfig?.rewards)
  const { data: exchangeParams, refetch: refetchExchangeParams } = useExchangeParams(protocolConfig?.exchange)
  const { data: clearingParams, refetch: refetchClearingParams } = useClearingParams(protocolConfig?.clearing)
  const { data: grantPlanParams, refetch: refetchGrantPlanParams } = useGrantPlanParams(protocolConfig)
  console.info(buyBackParams)
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
        value: nonBigNumberInterception(buyBackParams.buyback_period, 8)
      },
      {
        parameters: t('Nav.SystemParameters.BuybackSlippageTolerance'),
        value: `${bnMul(buyBackParams.buyback_sllipage, 100)}%`
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
  }, [exchangeParams, clearingParams, grantPlanParams, protocolParams])

  const trading = useMemo(() => {
    return [
      { parameters: t('Nav.SystemParameters.kPCFRate'), value: '' },
      { parameters: t('Nav.SystemParameters.yPCFRate'), value: '' },
      { parameters: t('Nav.SystemParameters.PCF'), value: '' },
      { parameters: t('Nav.SystemParameters.TradingFeeRatio'), value: '' },
      { parameters: t('Nav.SystemParameters.Maxlimitorders'), value: '' },
      { parameters: t('Nav.SystemParameters.Maxleverage'), value: '' }
    ]
  }, [t])

  const webColumns = [
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
    if (protocolConfig) {
      void refetchRewardsParams()
      void refetchExchangeParams()
      void refetchClearingParams()
      void refetchGrantPlanParams()
    }
  }, [protocolConfig])

  return (
    <div className="web-table-page">
      <div className="web-system-title">
        {t('Nav.SystemParameters.SystemParameters')}-{marginToken}
      </div>
      <header className="web-table-page-header">
        <h3>{t('Nav.SystemParameters.SystemRelevant')}</h3>
      </header>
      <Table className="web-broker-table" columns={webColumns} data={system} rowKey="parameters" />
      <header className="web-table-page-header">
        <h3>{t('Nav.SystemParameters.TradingToken')}</h3>
      </header>
      <Table className="web-broker-table" columns={webColumns} data={trading} rowKey="parameters" />
    </div>
  )
}

export default System
