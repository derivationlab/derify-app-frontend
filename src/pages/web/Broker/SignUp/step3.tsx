import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import QuestionPopover from '@/components/common/QuestionPopover'
import Button from '@/components/common/Button'

const BrokerSignUpStep3: FC = () => {
  const { t } = useTranslation()
  return (
    <div className="web-broker-sign-up-step-3">
      <h3>{t('Broker.Reg.Congratulation', 'Congratulation!')}</h3>
      <p>{t('Broker.Reg.CongratulationTip', 'Your broker privilege is ready!')}</p>
      <Button to="/broker-workbench">{t('Broker.Reg.CheckItOut', 'Check it out')}</Button>
    </div>
  )
}

export default BrokerSignUpStep3
