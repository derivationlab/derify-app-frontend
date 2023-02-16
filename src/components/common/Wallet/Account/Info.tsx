import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import QuestionPopover from '@/components/common/QuestionPopover'
import BalanceShow from '../BalanceShow'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { useMarginToken } from '@/zustand'

interface Props {
  size?: string
}

const AccountInfo: FC<Props> = ({ size = 'default' }) => {
  const { t } = useTranslation()
  const marginToken = useMarginToken((state) => state.marginToken)

  const variables = useTraderInfo((state) => state.variables)

  return (
    <>
      <dl>
        <dt>
          {t('Nav.Account.MarginBalance', 'Margin Balance')}{' '}
          <QuestionPopover size={size} text={t('Nav.Account.MarginBalanceTip', 'Margin Balance')} />
        </dt>
        <dd>
          <BalanceShow value={variables?.marginBalance ?? 0} unit={marginToken} />
        </dd>
      </dl>
      <dl>
        <dt>
          {t('Nav.Account.AvaliableMarginBalance', 'Available Margin Balance')}{' '}
          <QuestionPopover size={size} text={t('Nav.Account.AvaliableMarginBalanceTip', 'Available Margin Balance')} />
        </dt>
        <dd>
          <BalanceShow value={variables?.availableMargin ?? 0} unit={marginToken} />
        </dd>
      </dl>
    </>
  )
}

AccountInfo.defaultProps = {}

export default AccountInfo
