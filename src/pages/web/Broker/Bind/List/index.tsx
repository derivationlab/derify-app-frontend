import { bindingYourBroker, getBrokersList } from 'derify-apis-v20'
import { useSetAtom } from 'jotai'
import { useAccount } from 'wagmi'

import React, { FC, useCallback, useEffect, useReducer } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import { asyncUserBrokerBoundAtom } from '@/atoms/useBrokerData'
import Select from '@/components/common/Form/Select'
import Pagination from '@/components/common/Pagination'
import { Link } from '@/components/common/Route'
import Spinner from '@/components/common/Spinner'
import {
  SelectLangOptionsForFilter as SelectLangOptions,
  SelectCommunityOptionsForFilter as SelectCommunityOptions
} from '@/data'
import { reducer, stateInit } from '@/reducers/brokerBind'
import { useMarginTokenStore } from '@/store'
import { Rec } from '@/typings'

import BrokerDialog from '../BrokerDialog'
import BrokerItem from './BrokerItem'

const pageSize = 10

const List: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)
  const history = useHistory()
  const { t } = useTranslation()
  const { address } = useAccount()
  const asyncUserBrokerBound = useSetAtom(asyncUserBrokerBoundAtom(address))
  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const onPagination = async (index: number) => {
    dispatch({ type: 'SET_BROKER_DAT', payload: { isLoaded: true, pageIndex: index } })

    await getBrokersListCb(index)
  }

  const confirmBrokerEv = async (broker: Record<string, any>) => {
    dispatch({ type: 'SET_TO_BIND_DAT', payload: broker })
    dispatch({ type: 'SET_SHOW_MODAL', payload: 'broker' })
  }

  const bindBrokerFunc = async () => {
    const toast = window.toast.loading(t('common.pending'))

    dispatch({ type: 'SET_OPT_SELECT', payload: { i: state.toBindDAT.id } })
    dispatch({ type: 'SET_SHOW_MODAL', payload: '' })

    const data = await bindingYourBroker<{ code: number }>({ trader: address, brokerId: state.toBindDAT.id })

    if (data.code === 0) {
      // succeed
      window.toast.success(t('common.success'))
      void (await asyncUserBrokerBound())
      history.push('/broker')
    } else {
      // failed
      window.toast.error('Already bind broker')
      // window.toast.error(data.msg, { duration: 40000 })
    }

    dispatch({ type: 'SET_OPT_SELECT', payload: { i: '' } })

    window.toast.dismiss(toast)
  }

  const getBrokersListCb = useCallback(
    async (index: number) => {
      const {
        data: { records, totalItems }
      } = await getBrokersList<{ data: Rec }>(
        marginToken.address,
        state.optSelect.l,
        state.optSelect.c,
        index,
        pageSize
      )
      dispatch({ type: 'SET_BROKER_DAT', payload: { isLoaded: false, records, totalItems } })
    },
    [state.optSelect, marginToken]
  )

  useEffect(() => {
    void getBrokersListCb(0)
  }, [state.optSelect])

  return (
    <div className="web-broker-list">
      <header className="web-broker-list-header">
        <h2>{t('Nav.BindBroker.SelectBroker', 'Select a broker')}</h2>
        <Link to="/broker/bind">
          {!isMobile ? t('Nav.BindBroker.InputCode', 'I want to input my broker code ...') : ''}
        </Link>
      </header>
      <section className="web-broker-list-filter">
        <main>
          <Select
            label={t('Nav.BindBroker.Language', 'Language')}
            value={state.optSelect.l}
            options={SelectLangOptions}
            onChange={(value) => dispatch({ type: 'SET_OPT_SELECT', payload: { l: value } })}
          />
          <Select
            label={t('Nav.BindBroker.Community', 'Community')}
            value={state.optSelect.c}
            options={SelectCommunityOptions}
            onChange={(value) => dispatch({ type: 'SET_OPT_SELECT', payload: { c: value } })}
          />
        </main>
        {!isMobile && (
          <Pagination
            page={state.brokerDAT.pageIndex}
            pageSize={pageSize}
            total={state.brokerDAT.totalItems}
            onChange={onPagination}
          />
        )}
      </section>
      <main className="web-broker-list-main">
        {state.brokerDAT.records.map((broker: Record<string, any>, index) => (
          <BrokerItem operating={state.optSelect.i} data={broker} key={index} onClick={() => confirmBrokerEv(broker)} />
        ))}
      </main>
      <Pagination
        pageSize={pageSize}
        full={!isMobile}
        page={state.brokerDAT.pageIndex}
        total={state.brokerDAT.totalItems}
        onChange={onPagination}
      />
      {state.brokerDAT.isLoaded && <Spinner fixed />}
      <BrokerDialog
        visible={state.showModal === 'broker'}
        data={state.toBindDAT}
        onClick={bindBrokerFunc}
        onClose={() => dispatch({ type: 'SET_SHOW_MODAL', payload: '' })}
      />
    </div>
  )
}

export default List
