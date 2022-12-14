import { useAccount } from 'wagmi'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import { useHistory, useLocation } from 'react-router-dom'
import React, { FC, useState, useEffect } from 'react'
import { SelectLangOptions } from '@/data'
import { calcShortHash } from '@/utils/tools'
import { useTraderData } from '@/store/trader/hooks'
import { patterns, rules } from '../config'
// import { AccountTip } from '../Web'
import MFormItem from './c/FormItem'
import Button from '@/components/common/Button'
import { getBrokerInfoById, updateBrokerInfo } from '@/api'
import { getBrokerDataAsync } from '@/store/trader'
import { useAppDispatch } from '@/store'

const BrokerSignUpStep2Mobile: FC = () => {
  const history = useHistory()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { data: account } = useAccount()
  const { broker, brokerLoaded } = useTraderData()

  const [brokerId, setBrokerId] = useState<string>('')
  const [brokerLang, setBrokerLang] = useState<string>(SelectLangOptions[0])
  const [brokerComm, setBrokerComm] = useState<string>('{}')
  const [brokerName, setBrokerName] = useState<string>('')
  const [brokerLogo, setBrokerLogo] = useState<string>('')
  const [fileObject, setFileObject] = useState<File>()
  const [brokerIntr, setBrokerIntr] = useState<string>('')
  const [brokerAcco, setBrokerAcco] = useState<string>('')

  const onSubmitFunc = async () => {
    const {
      Telegram: telegram,
      Discord: discord,
      Twitter: twitter,
      Reddit: reddit,
      WeChat: wechat
    } = JSON.parse(brokerComm)

    const _logo = fileObject instanceof File ? fileObject : brokerLogo

    if (!_logo) {
      window.toast.error(t('Broker.Reg.ReCheck', 'Information is incomplete, please re-check.'))
      return
    }

    if ((_logo as File)?.size > Math.pow(1024, 2)) {
      window.toast.error(t('Broker.Reg.UploadImageTip', 'Image file size should be less than 2M, please retry.'))
      return
    }

    if (!brokerIntr || !brokerName || !brokerId) {
      window.toast.error(t('Broker.Reg.ReCheck', 'Information is incomplete, please re-check.'))
      return
    }

    if (!telegram && !discord && !twitter && !reddit && !wechat) {
      window.toast.error(t('Broker.Reg.ReCheck', 'Information is incomplete, please re-check.'))
      return
    }

    if (telegram && !patterns.telegram.test(telegram)) {
      window.toast.error('Error telegram url')
      return
    }

    if (discord && !patterns.discord.test(discord)) {
      window.toast.error('Error discord url')
      return
    }

    if (twitter && !patterns.twitter.test(twitter)) {
      window.toast.error('Error twitter url')
      return
    }

    if (reddit && !patterns.reddit.test(reddit)) {
      window.toast.error('Error reddit url')
      return
    }

    if (wechat && !patterns.wechat.test(wechat)) {
      window.toast.error('Error wechat account')
      return
    }

    const { data: brokerInfo } = await getBrokerInfoById(brokerId)

    if (!isEmpty(brokerInfo) && brokerInfo[0]?.broker !== account?.address) {
      window.toast.error(t('Broker.Reg.Occupied', 'Your Code is occupied, choose another one.'))
      return
    }

    const data = await updateBrokerInfo({
      logo: _logo,
      id: brokerId,
      name: brokerName,
      broker: brokerAcco,
      introduction: brokerIntr,
      language: brokerLang,
      telegram: telegram ?? '',
      discord: discord ?? '',
      twitter: twitter ?? '',
      reddit: reddit ?? '',
      wechat: wechat ?? ''
    })

    if (data.code === 0) {
      if (account?.address) dispatch(getBrokerDataAsync(account?.address))
      history.push('/broker/sign-up/step3')
    }
  }

  useEffect(() => {
    if (pathname === '/broker-edit' && brokerLoaded && !isEmpty(broker)) {
      const {
        introduction,
        language,
        broker: _broker,
        name,
        id,
        logo,
        telegram,
        discord,
        twitter,
        reddit,
        wechat
      } = broker

      const index = SelectLangOptions.findIndex((l: string) => l === language) ?? 0

      setBrokerId(id)
      setBrokerName(name)
      setBrokerLogo(logo)
      setBrokerAcco(_broker)
      setBrokerIntr(introduction)
      setBrokerLang(SelectLangOptions[index])
      setBrokerComm(
        JSON.stringify({
          Telegram: telegram,
          Discord: discord,
          Twitter: twitter,
          Reddit: reddit,
          WeChat: wechat
        })
      )
    }
  }, [pathname, broker, brokerLoaded])

  useEffect(() => {
    if (account?.address) setBrokerAcco(account.address)
  }, [account?.address])

  return (
    <div className="m-reg">
      {/*tip={<AccountTip />}*/}
      <MFormItem
        readOnly
        label={t('Broker.Reg.Account', 'Account')}
        type="input"
        value={brokerAcco}
        rules={rules.broker}
        format={(val: string) => calcShortHash(val, 6, 4)}
        onChange={(val: string) => setBrokerAcco(val)}
      />
      <MFormItem
        label={t('Broker.Reg.Name', 'Name')}
        type="input"
        value={brokerName}
        rules={rules.name}
        onChange={(val: string) => setBrokerName(val)}
      />
      <MFormItem
        label={t('Broker.Reg.Logo', 'Logo')}
        type="logo"
        value={brokerLogo}
        onChange={(val: string, file?: File) => {
          setBrokerLogo(val)
          setFileObject(file)
        }}
        tip={t('Broker.Reg.LogoSize', 'Logo size up to 400*400px and 2MB.')}
      />
      <MFormItem
        label={t('Broker.Reg.BrokerCode', 'Broker Code')}
        type="input"
        value={brokerId}
        rules={rules.id}
        onChange={(val: string) => setBrokerId(val)}
        tip="This is your broker code which you should share to your trader."
      />
      <MFormItem
        label={t('Broker.Reg.Language', 'Language')}
        type="language"
        value={brokerLang}
        onChange={(val: string) => setBrokerLang(val)}
      />
      <MFormItem
        label={t('Broker.Reg.Community', 'Community')}
        type="community"
        value={brokerComm}
        onChange={(val: string) => setBrokerComm(val)}
      />
      <MFormItem
        label={t('Broker.Reg.Introduction', 'Introduction')}
        tip={t('Broker.Reg.Less', 'Less than 500 characters.')}
        type="textarea"
        value={brokerIntr}
        rules={rules.introduction}
        onChange={(val: string) => setBrokerIntr(val)}
      />
      <footer>
        <Button onClick={onSubmitFunc}>{t('Broker.Reg.Confirm', 'Confirm')}</Button>
      </footer>
    </div>
  )
}

export default BrokerSignUpStep2Mobile
