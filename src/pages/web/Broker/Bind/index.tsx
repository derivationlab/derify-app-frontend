import React, { ChangeEvent, FC, useState, useContext } from 'react'
import { useAccount } from 'wagmi'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useAppDispatch } from '@/store'
import { MobileContext } from '@/context/Mobile'
import { getBrokerBoundDataAsync } from '@/store/trader'
import { bindYourBroker, getBrokerInfoById } from '@/api'

import Button from '@/components/common/Button'
import BrokerDialog from './BrokerDialog'

const Bind: FC = () => {
  const history = useHistory()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)
  const { data: account } = useAccount()

  const [brokerId, setBrokerId] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [brokerData, setBrokerData] = useState<Record<string, any>>({})
  const [visibleStatus, setVisibleStatus] = useState<string>('')

  const onChangeEv = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setBrokerId(v)
  }

  const bindBrokerEv = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    setVisibleStatus('')

    const data = await bindYourBroker({ trader: account?.address, brokerId })
    if (data.code === 0) {
      // succeed
      if (account?.address) dispatch(getBrokerBoundDataAsync(account.address))
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

    const { data } = await getBrokerInfoById(brokerId)

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
        <Button full={mobile} disabled={!brokerId.trim()} loading={loading} onClick={onConfirmEv}>
          {t('Nav.BindBroker.Confirm', 'Confirm')}
        </Button>
        <Button full={mobile} outline to="/broker-bind/list">
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
