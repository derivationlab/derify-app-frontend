import { useAtomValue } from 'jotai'

import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { traderVariablesAtom } from '@/atoms/useTraderVariables'
import QuestionPopover from '@/components/common/QuestionPopover'
import Skeleton from '@/components/common/Skeleton'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'

import BalanceShow from '../BalanceShow'

interface Props {
  size?: string
}

const AccountInfo: FC<Props> = ({ size = 'default' }) => {
  const { t } = useTranslation()
  const variables = useAtomValue(traderVariablesAtom)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  const decimals1 = useMemo(() => {
    if (Number(variables.data.marginBalance) === 0) return 2
    return marginToken.decimals
  }, [marginToken, variables])

  const decimals2 = useMemo(() => {
    if (Number(variables.data.availableMargin) === 0) return 2
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
          <Skeleton rowsProps={{ rows: 1 }} animation loading={!variables.loaded}>
            <BalanceShow value={variables.data.marginBalance} unit={marginToken.symbol} decimal={decimals1} />
          </Skeleton>
        </dd>
      </dl>
      <dl>
        <dt>
          {t('Nav.Account.AvaliableMarginBalance', 'Available Margin Balance')}{' '}
          <QuestionPopover size={size} text={t('Nav.Account.AvaliableMarginBalanceTip', 'Available Margin Balance')} />
        </dt>
        <dd>
          <Skeleton rowsProps={{ rows: 1 }} animation loading={!variables.loaded}>
            <BalanceShow value={variables.data.availableMargin} unit={marginToken.symbol} decimal={decimals2} />
          </Skeleton>
        </dd>
      </dl>
    </>
  )
}

export default AccountInfo
