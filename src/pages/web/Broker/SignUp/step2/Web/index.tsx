import { useAtomValue, useSetAtom } from 'jotai'
import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'

import React, { FC, useContext, useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useHistory, useLocation } from 'react-router-dom'

import { getBrokerInfoWithBrokerId, updateBrokerInfo } from '@/api'
import { asyncBrokerInfoAtom, brokerInfoAtom } from '@/atoms/useBrokerData'
import Button from '@/components/common/Button'
import Form from '@/components/common/Form/Form'
import FormInput from '@/components/common/Form/FormInput'
import FormItem from '@/components/common/Form/FormItem'
import FormSelect from '@/components/common/Form/FormSelect'
import FormUploadImage from '@/components/common/Form/FormUploadImage'
import { API_PREFIX_URL } from '@/config'
import { SelectLangOptions } from '@/data'
import { ThemeContext } from '@/providers/Theme'

import { defaultValues, FormInputProps, patterns, rules } from '../config'

export const AccountTip: FC = () => {
  const { t } = useTranslation()
  return (
    <>
      {t('Broker.Reg.RuleTip1', 'Letters and numbers and "_" are accepted.')} <br />
      <em>{t('Broker.Reg.CodeTip', 'This is your broker code which you should share to your trader.')}</em>
    </>
  )
}

const BrokerSignUpStep2: FC = () => {
  const history = useHistory()
  const formMode = useForm({ defaultValues })
  const { t } = useTranslation()
  const { theme } = useContext(ThemeContext)
  const { address } = useAccount()
  const { pathname } = useLocation()
  const { handleSubmit, setValue: setFormValue } = formMode
  const brokerInfo = useAtomValue(brokerInfoAtom)
  const asyncBrokerInfo = useSetAtom(asyncBrokerInfoAtom(address))

  const goSubmit: SubmitHandler<FormInputProps> = async (form: FormInputProps) => {
    // console.log(form)
    const { introduction, broker, name, id, logo, telegram, discord, twitter, reddit, wechat, language } = form
    const _logo = logo instanceof FileList ? logo[0] : logo

    if (!_logo) {
      window.toast.error(t('Broker.Reg.ReCheck', 'Information is incomplete, please re-check.'))
      return
    }
    if ((_logo as File)?.size > 2 * Math.pow(1024, 2)) {
      window.toast.error(t('Broker.Reg.UploadImageTip', 'Image file size should be less than 2M, please retry.'))
      return
    }
    // if (!telegram && !discord && !twitter && !reddit && !wechat) {
    //   window.toast.error(t('Broker.Reg.ReCheck', 'Information is incomplete, please re-check.'))
    //   return
    // }

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

    const { data: brokerInfo } = await getBrokerInfoWithBrokerId(id)

    if (!isEmpty(brokerInfo) && brokerInfo[0]?.broker !== address) {
      window.toast.error(t('Broker.Reg.Occupied', 'Your Code is occupied, choose another one.'))
      return
    }

    const data = await updateBrokerInfo({
      logo: _logo,
      id,
      name,
      broker,
      introduction,
      language,
      telegram: telegram ?? '',
      discord: discord ?? '',
      twitter: twitter ?? '',
      reddit: reddit ?? '',
      wechat: wechat ?? ''
    })

    if (data.code === 0) history.push('/broker/sign-up/step3')
  }

  useEffect(() => {
    if (pathname === '/broker/edit' && brokerInfo) {
      const {
        id,
        logo,
        name,
        broker: _broker,
        language,
        telegram,
        discord,
        twitter,
        reddit,
        wechat,
        introduction
      } = brokerInfo

      if (logo) {
        const index = logo.lastIndexOf('/')
        setFormValue('logo', `${API_PREFIX_URL}${logo.substring(index + 1)}` as any)
      }

      setFormValue('id', id)
      setFormValue('name', name)
      setFormValue('broker', _broker)
      setFormValue('language', language || 'English')
      setFormValue('telegram', telegram)
      setFormValue('discord', discord)
      setFormValue('twitter', twitter)
      setFormValue('reddit', reddit)
      setFormValue('wechat', wechat)
      setFormValue('introduction', introduction)
    } else {
      setFormValue('language', 'English')
    }
  }, [pathname, brokerInfo])

  useEffect(() => {
    if (address) {
      setFormValue('broker', address)
      void asyncBrokerInfo()
    }
  }, [address])

  return (
    <div className="web-broker-sign-up">
      <header className="web-broker-sign-up-header">
        {pathname === '/broker/edit'
          ? t('Broker.Reg.EditBrokerInfo', 'Edit broker info')
          : t('Broker.Reg.RegisterForBroker', 'Register for broker')}
      </header>
      <section className="web-broker-sign-up-step-2">
        <Form mode={formMode} rules={rules}>
          <FormItem label={t('Broker.Reg.Account', 'Account')} prop="broker">
            <FormInput name="broker" maxLength={42} readOnly />
          </FormItem>
          <FormItem label={t('Broker.Reg.Name', 'Name')} prop="name">
            <FormInput name="name" maxLength={60} clearable />
          </FormItem>
          <FormItem
            label={t('Broker.Reg.Logo', 'Logo')}
            prop="logo"
            hideError
            tip={t('Broker.Reg.LogoSize', 'Logo size up to 400*400px and 2MB.')}
          >
            <FormUploadImage name="logo" />
          </FormItem>
          <FormItem label={t('Broker.Reg.BrokerCode', 'Broker Code')} prop="id" tip={t('Broker.Reg.CodeTip')}>
            <FormInput name="id" maxLength={60} clearable />
          </FormItem>
          <FormItem label={t('Broker.Reg.Language', 'Language')} hideError>
            <FormSelect name="language" options={SelectLangOptions} />
          </FormItem>
          <FormItem label={t('Broker.Reg.Community', 'Community')}>
            <FormItem
              label="Telegram"
              prop="telegram"
              showTip={false}
              hideError
              icon={`icon/telegram-${theme === 'Dark' ? 'dark' : 'line'}.svg`}
            >
              <FormInput name="telegram" maxLength={60} clearable />
            </FormItem>
            <FormItem
              label="Discord"
              prop="discord"
              showTip={false}
              hideError
              icon={`icon/discord-${theme === 'Dark' ? 'dark' : 'line'}.svg`}
            >
              <FormInput name="discord" maxLength={60} clearable />
            </FormItem>
            <FormItem
              label="Twitter"
              prop="twitter"
              showTip={false}
              hideError
              icon={`icon/twitter-${theme === 'Dark' ? 'dark' : 'line'}.svg`}
            >
              <FormInput name="twitter" maxLength={60} clearable />
            </FormItem>
            <FormItem
              label="Reddit"
              prop="reddit"
              showTip={false}
              hideError
              icon={`icon/reddit-${theme === 'Dark' ? 'dark' : 'line'}.svg`}
            >
              <FormInput name="reddit" maxLength={60} clearable />
            </FormItem>
            <FormItem
              label="WeChat"
              prop="wechat"
              showTip={false}
              hideError
              icon={`icon/wechat-${theme === 'Dark' ? 'dark' : 'line'}.svg`}
            >
              <FormInput name="wechat" maxLength={60} clearable />
            </FormItem>
          </FormItem>
          <FormItem
            label={t('Broker.Reg.Introduction', 'Introduction')}
            prop="introduction"
            tip={t('Broker.Reg.Less', 'Less than 500 characters.')}
          >
            <FormInput type="textarea" name="introduction" maxLength={500} clearable />
          </FormItem>
        </Form>
      </section>
      <footer className="web-broker-sign-up-footer">
        <Button onClick={handleSubmit(goSubmit)}>{t('Broker.Reg.Confirm', 'Confirm')}</Button>
        <Button outline to="/broker">
          {t('Broker.Reg.Cancel', 'Cancel')}
        </Button>
      </footer>
    </div>
  )
}

export default BrokerSignUpStep2
