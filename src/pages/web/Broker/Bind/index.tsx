import { bindingYourBroker, getBrokerInfoWithBrokerId } from 'derify-apis'
import { useSetAtom } from 'jotai'
import { useAccount } from 'wagmi'

import React, { ChangeEvent, FC, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import { asyncUserBrokerBoundAtom } from '@/atoms/useBrokerData'
import Button from '@/components/common/Button'
import { Rec } from '@/typings'

import BrokerDialog from './BrokerDialog'

const Bind: FC = () => {
  const history = useHistory()
  const { t } = useTranslation()
  const { address } = useAccount()
  const asyncUserBrokerBound = useSetAtom(asyncUserBrokerBoundAtom(address))

  const [brokerId, setBrokerId] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [brokerData, setBrokerData] = useState<Record<string, any>>({})
  const [visibleStatus, setVisibleStatus] = useState<string>('')

  const onChangeEv = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setBrokerId(v)
  }

  const bindBrokerEv = async () => {
    const toast = window.toast.loading(t('common.pending'))

    setVisibleStatus('')

    const data = await bindingYourBroker<{ code: number }>({ trader: address, brokerId })
    if (data.code === 0) {
      // succeed
      void (await asyncUserBrokerBound())
      history.push('/broker')
    } else {
      // failed
      // window.toast.error(data.msg)
      window.toast.error('Already bind broker')
    }

    window.toast.dismiss(toast)
  }

  const onConfirmEv = async () => {
    setLoading(true)

    const { data } = await getBrokerInfoWithBrokerId<{ data: Rec }>(brokerId)

    if (data && data[0]) {
      setBrokerData(data[0])
      setVisibleStatus('broker')
    } else {
      window.toast.error(t('Nav.BindBroker.ErrorCode', 'Broker Code does not exist or is invalid'))
    }

    setLoading(false)
  }

  return (
    <section className="web-broker-bind">
      <p>{t('Nav.BindBroker.Title1', 'You need a broker first, Please input your broker code.')}</p>
      <p>{t('Nav.BindBroker.Title2', 'You can get code from your broker.')}</p>
      <input type="text" onChange={onChangeEv} value={brokerId} />
      {/*<div contentEditable></div>*/}
      <div className="buttons">
        <Button full={isMobile} disabled={!brokerId.trim()} loading={loading} onClick={onConfirmEv}>
          {t('Nav.BindBroker.Confirm', 'Confirm')}
        </Button>
        <Button full={isMobile} outline to="/broker/list">
          {t('Nav.BindBroker.NoCode', "I don't have a code ...")}
        </Button>
      </div>

      <BrokerDialog
        visible={visibleStatus === 'broker'}
        data={brokerData}
        onClick={bindBrokerEv}
        onClose={() => setVisibleStatus('')}
      />
    </section>
  )
}

export default Bind
