import React, { FC, useCallback, useEffect, useState, useContext } from 'react'
import { useAccount } from 'wagmi'
import { useHistory, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { bindYourBroker, getBrokersList } from '@/api'
import { useAppDispatch } from '@/store'
import { getBrokerBoundDataAsync } from '@/store/trader'
import {
  SelectLangOptionsForFilter as SelectLangOptions,
  SelectCommunityOptionsForFilter as SelectCommunityOptions
} from '@/data'
import { MobileContext } from '@/context/Mobile'
import Pagination from '@/components/common/Pagination'
import Select from '@/components/common/Form/Select'
import BrokerDialog from '../BrokerDialog'
import BrokerItem from './BrokerItem'

const List: FC = () => {
  const history = useHistory()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { data: account } = useAccount()
  const { mobile } = useContext(MobileContext)

  const [language, setLanguage] = useState<string>('ALL')
  const [community, setCommunity] = useState<string>('ALL')
  const [operating, setOperating] = useState<string>('-')
  const [pageIndex, setPageIndex] = useState<number>(0)
  const [brokerList, setBrokerList] = useState<Record<string, any>>({})
  const [brokerData, setBrokerData] = useState<Record<string, any>>({})
  const [visibleStatus, setVisibleStatus] = useState<string>('')

  const onPageChangeEv = (index: number) => {
    setPageIndex(index)
    void getBrokersListCb()
  }

  const confirmBrokerEv = async (broker: Record<string, any>) => {
    setBrokerData(broker)
    setVisibleStatus('broker')
  }

  const bindBrokerFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    setOperating(brokerData.id)
    setVisibleStatus('')

    const data = await bindYourBroker({ trader: account?.address, brokerId: brokerData.id })

    if (data.code === 0) {
      // succeed
      window.toast.success(t('common.success', 'success'))
      if (account?.address) dispatch(getBrokerBoundDataAsync(account.address))
      history.push('/broker')
    } else {
      // failed
      window.toast.error('Already bind broker')
      // window.toast.error(data.msg, { duration: 40000 })
    }

    setOperating('')

    window.toast.dismiss(toast)
  }

  const getBrokersListCb = useCallback(async () => {
    const { data } = await getBrokersList(pageIndex, 10, language, community)

    setBrokerList(data)
  }, [language, community, pageIndex])

  useEffect(() => {
    void getBrokersListCb()
  }, [language, community, pageIndex, getBrokersListCb])

  return (
    <div className="web-broker-list">
      <header className="web-broker-list-header">
        <h2>{t('Nav.BindBroker.SelectBroker', 'Select a broker')}</h2>
        <Link to="/broker-bind">
          {!mobile ? t('Nav.BindBroker.InputCode', 'I want to input my broker code ...') : ''}
        </Link>
      </header>
      <section className="web-broker-list-filter">
        <main>
          <Select
            label={t('Nav.BindBroker.Language', 'Language')}
            value={language}
            options={SelectLangOptions}
            onChange={(value) => setLanguage(String(value))}
          />
          <Select
            label={t('Nav.BindBroker.Community', 'Community')}
            value={community}
            options={SelectCommunityOptions}
            onChange={(value) => setCommunity(String(value))}
          />
        </main>
        {!mobile && <Pagination page={pageIndex} total={brokerList?.totalItems ?? 0} onChange={onPageChangeEv} />}
      </section>
      <main className="web-broker-list-main">
        {brokerList?.records?.map((broker: Record<string, any>) => (
          <BrokerItem operating={operating} data={broker} key={broker.id} onClick={() => confirmBrokerEv(broker)} />
        ))}
      </main>
      <Pagination full={!mobile} page={pageIndex} total={brokerList?.totalItems ?? 0} onChange={onPageChangeEv} />

      <BrokerDialog
        visible={visibleStatus === 'broker'}
        data={brokerData}
        onClick={bindBrokerFunc}
        onClose={() => setVisibleStatus('')}
      />
    </div>
  )
}

export default List
