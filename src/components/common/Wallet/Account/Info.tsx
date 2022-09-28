import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccount, useConnect } from 'wagmi'

import { useAppDispatch } from '@/store'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { getTraderDataAsync } from '@/store/trader'
import { useTraderData } from '@/store/trader/hooks'
import { useContractData } from '@/store/contract/hooks'

import QuestionPopover from '@/components/common/QuestionPopover'
import BalanceShow from '../BalanceShow'

interface Props {
  size?: string
}

const AccountInfo: FC<Props> = ({ size = 'default' }) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { trader } = useTraderData()
  const { pairs, currentPair } = useContractData()
  const { data: account } = useAccount()
  const { isConnected } = useConnect()

  const memoPairInfo = useMemo(() => {
    return pairs.find((pair) => pair.token === currentPair)
  }, [pairs, currentPair])

  useEffect(() => {
    if (isConnected && account?.address) {
      dispatch(getTraderDataAsync(account?.address))
    }
  }, [isConnected, account?.address, dispatch, memoPairInfo?.spotPrice])

  return (
    <>
      <dl>
        <dt>
          {t('Nav.Account.MarginBalance', 'Margin Balance')}{' '}
          <QuestionPopover size={size} text={t('Nav.Account.MarginBalanceTip', 'Margin Balance')} />
        </dt>
        <dd>
          <BalanceShow value={trader.marginBalance} unit={BASE_TOKEN_SYMBOL} />
        </dd>
      </dl>
      <dl>
        <dt>
          {t('Nav.Account.AvaliableMarginBalance', 'Available Margin Balance')}{' '}
          <QuestionPopover size={size} text={t('Nav.Account.AvaliableMarginBalanceTip', 'Available Margin Balance')} />
        </dt>
        <dd>
          <BalanceShow value={trader.availableMargin} unit={BASE_TOKEN_SYMBOL} />
        </dd>
      </dl>
    </>
  )
}

AccountInfo.defaultProps = {}

export default AccountInfo
