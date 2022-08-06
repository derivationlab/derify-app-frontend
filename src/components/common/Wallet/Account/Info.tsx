import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useTraderData } from '@/store/trader/hooks'

import QuestionPopover from '@/components/common/QuestionPopover'

import BalanceShow from '../BalanceShow'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'

interface Props {
  size?: string
}

const AccountInfo: FC<Props> = ({ size = 'default' }) => {
  const { t } = useTranslation()
  const { trader } = useTraderData()

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
