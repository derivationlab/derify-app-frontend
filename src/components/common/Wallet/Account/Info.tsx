import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useMarginTokenStore, useTraderInfoStore, useTraderVariablesStore } from '@/store'

import Skeleton from '@/components/common/Skeleton'
import QuestionPopover from '@/components/common/QuestionPopover'

import BalanceShow from '../BalanceShow'

interface Props {
  size?: string
}

const AccountInfo: FC<Props> = ({ size = 'default' }) => {
  const { t } = useTranslation()

  const variables = useTraderVariablesStore((state) => state.variables)
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const variablesLoaded = useTraderVariablesStore((state) => state.variablesLoaded)

  return (
    <>
      <dl>
        <dt>
          {t('Nav.Account.MarginBalance', 'Margin Balance')}{' '}
          <QuestionPopover size={size} text={t('Nav.Account.MarginBalanceTip', 'Margin Balance')} />
        </dt>
        <dd>
          <Skeleton rowsProps={{ rows: 1 }} animation loading={!variablesLoaded}>
            <BalanceShow value={variables?.marginBalance ?? 0} unit={marginToken.symbol} />
          </Skeleton>
        </dd>
      </dl>
      <dl>
        <dt>
          {t('Nav.Account.AvaliableMarginBalance', 'Available Margin Balance')}{' '}
          <QuestionPopover size={size} text={t('Nav.Account.AvaliableMarginBalanceTip', 'Available Margin Balance')} />
        </dt>
        <dd>
          <Skeleton rowsProps={{ rows: 1 }} animation loading={!variablesLoaded}>
            <BalanceShow value={variables?.availableMargin ?? 0} unit={marginToken.symbol} />
          </Skeleton>
        </dd>
      </dl>
    </>
  )
}

export default AccountInfo
