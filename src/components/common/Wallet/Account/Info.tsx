import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccount } from 'wagmi'

import { useAppDispatch } from '@/store'
import { getTraderDataAsync } from '@/store/trader'
import { useTraderData } from '@/store/trader/hooks'
import { useMatchConfig } from '@/hooks/useMatchConfig'
import { useContractData } from '@/store/contract/hooks'
import { useContractConfig } from '@/store/config/hooks'

import QuestionPopover from '@/components/common/QuestionPopover'
import BalanceShow from '../BalanceShow'

interface Props {
  size?: string
}

const AccountInfo: FC<Props> = ({ size = 'default' }) => {
  const dispatch = useAppDispatch()

  const { t } = useTranslation()
  const { data } = useAccount()
  const { trader } = useTraderData()
  const { marginToken } = useContractConfig()
  const { pairs, currentPair } = useContractData()
  const { protocolConfig, protocolConfigLoaded } = useMatchConfig()

  const memoPairInfo = useMemo(() => {
    return pairs.find((pair) => pair.token === currentPair)
  }, [pairs, currentPair])

  useEffect(() => {
    if (data?.address && protocolConfigLoaded) {
      dispatch(getTraderDataAsync({ trader: data.address, contract: protocolConfig.exchange }))
    }
  }, [protocolConfig, protocolConfigLoaded, data, dispatch, memoPairInfo?.spotPrice])

  return (
    <>
      <dl>
        <dt>
          {t('Nav.Account.MarginBalance', 'Margin Balance')}{' '}
          <QuestionPopover size={size} text={t('Nav.Account.MarginBalanceTip', 'Margin Balance')} />
        </dt>
        <dd>
          <BalanceShow value={trader?.marginBalance ?? 0} unit={marginToken} />
        </dd>
      </dl>
      <dl>
        <dt>
          {t('Nav.Account.AvaliableMarginBalance', 'Available Margin Balance')}{' '}
          <QuestionPopover size={size} text={t('Nav.Account.AvaliableMarginBalanceTip', 'Available Margin Balance')} />
        </dt>
        <dd>
          <BalanceShow value={trader?.availableMargin ?? 0} unit={marginToken} />
        </dd>
      </dl>
    </>
  )
}

AccountInfo.defaultProps = {}

export default AccountInfo
