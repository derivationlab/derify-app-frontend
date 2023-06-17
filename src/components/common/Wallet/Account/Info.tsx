import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import QuestionPopover from '@/components/common/QuestionPopover'
import Skeleton from '@/components/common/Skeleton'
import { useMarginTokenStore, useTraderVariablesStore } from '@/store'
import { MarginTokenState } from '@/store/types'

import BalanceShow from '../BalanceShow'

interface Props {
  size?: string
}

const AccountInfo: FC<Props> = ({ size = 'default' }) => {
  const { t } = useTranslation()

  const variables = useTraderVariablesStore((state) => state.variables)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const variablesLoaded = useTraderVariablesStore((state) => state.variablesLoaded)

  const decimals = useMemo(() => {
    const p1 = variables?.marginBalance ?? 0
    if (Number(p1) === 0) return 2
    return marginToken.decimals
  }, [marginToken, variables])

  return (
    <>
      <dl>
        <dt>
          {t('Nav.Account.MarginBalance', 'Margin Balance')}{' '}
          <QuestionPopover size={size} text={t('Nav.Account.MarginBalanceTip', 'Margin Balance')} />
        </dt>
        <dd>
          <Skeleton rowsProps={{ rows: 1 }} animation loading={!variablesLoaded}>
            <BalanceShow value={variables?.marginBalance ?? 0} unit={marginToken.symbol} decimal={decimals} />
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
            <BalanceShow value={variables?.availableMargin ?? 0} unit={marginToken.symbol} decimal={decimals} />
          </Skeleton>
        </dd>
      </dl>
    </>
  )
}

export default AccountInfo
