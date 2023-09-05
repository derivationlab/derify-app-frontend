import { Form, Input } from '@arco-design/web-react'
import { useAccount, useSigner } from 'wagmi'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import Button from '@/components/common/Button'
import { PLATFORM_TOKEN } from '@/config/tokens'
import { checkAdvisorAddress } from '@/funcs/helper'
import { useApplyToken, usePaymentAmount } from '@/hooks/useApplyToken'
import ApplyOptions, { applyTypeOptions } from '@/pages/web/userApply/ApplyOptions'
import PaymentOptions, { paymentTypeOptionsDef } from '@/pages/web/userApply/PaymentOptions'
import { useBalancesStore } from '@/store'
import { isET, isLT, keepDecimals } from '@/utils/tools'

export const config = {
  amount: 100000,
  period: 365
}
const FormItem = Form.Item

const MarginApply = () => {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const { applyNewMarginToken } = useApplyToken()
  const [isLoading, setLoading] = useBoolean(false)
  const [payment, setPayment] = useState<string>(paymentTypeOptionsDef)
  const balances = useBalancesStore((state) => state.balances)
  const paymentAmount = usePaymentAmount(payment)

  const balance = useMemo(() => balances?.[PLATFORM_TOKEN.symbol] ?? 0, [balances])

  const disabled = useMemo(() => {
    return !signer || isET(balance, 0) || isLT(balance, config.amount)
  }, [signer, balance])

  const func = useCallback(async () => {
    setLoading(true)
    const toast = window.toast.loading(t('common.pending'))
    const { marginName, marginSymbol, marginToken, payment, advisor, paymentAmount } = form.getFieldsValue([
      'marginName',
      'marginSymbol',
      'marginToken',
      'payment',
      'advisor',
      'paymentAmount'
    ])

    console.info({
      marginToken,
      paymentToken: payment,
      paymentAmount,
      advisorAddress: advisor,
      signer
    })
    const status = await applyNewMarginToken({
      marginToken,
      paymentToken: payment,
      paymentAmount,
      advisorAddress: advisor,
      signer
    })
    if (status) {
      window.toast.success(t('common.success'))
      form.resetFields()
    } else {
      window.toast.error(t('common.failed'))
    }
    setLoading(false)
    window.toast.dismiss(toast)
  }, [signer])

  useEffect(() => {
    form.setFieldValue('paymentAmount', paymentAmount)
  }, [paymentAmount])

  return (
    <section className="web-user-apply-margin">
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        initialValues={{ payment: paymentTypeOptionsDef, applyType: applyTypeOptions[0].val }}
      >
        <FormItem field="applyType">
          <ApplyOptions />
        </FormItem>
        <FormItem field="marginName" rules={[{ required: true, message: t('Apply.Required') }]}>
          <Input prefix={t('Apply.Name')} />
        </FormItem>
        <FormItem field="marginSymbol" rules={[{ required: true, message: t('Apply.Required') }]}>
          <Input prefix={t('Apply.Symbol')} />
        </FormItem>
        <FormItem field="marginToken" rules={[{ required: true, message: t('Apply.Required') }]}>
          <Input prefix={t('Apply.Address')} />
        </FormItem>
        <FormItem field="payment">
          <PaymentOptions onChange={setPayment} />
        </FormItem>
        <FormItem field="paymentAmount">
          <Input prefix={t('Apply.Fee')} readOnly />
        </FormItem>
        <FormItem
          field="advisor"
          rules={[
            {
              validator: async (value, callback) => {
                const status = await checkAdvisorAddress(address ?? '')
                if (status) {
                  return callback()
                } else {
                  return callback(t('Apply.NotExist'))
                }
              },
              required: true,
              message: t('Apply.Required')
            }
          ]}
        >
          <Input prefix={t('Apply.Advisor')} />
        </FormItem>
        <div className="form-item-balance">
          <span>{t('Advisor.balance')}</span>
          <span>
            {keepDecimals(balance, PLATFORM_TOKEN.decimals, true)} {PLATFORM_TOKEN.symbol}
          </span>
        </div>
        <div className="form-item-tips">
          <a href="/">{t('Apply.NoAdvisor')}</a>
        </div>
        <Button full onClick={func} loading={isLoading} disabled={disabled}>
          {t('Apply.Pay')}
        </Button>
      </Form>
    </section>
  )
}

export default MarginApply
