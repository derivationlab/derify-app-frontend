import { Form, Input } from '@arco-design/web-react'
import { applyMarginToken } from 'derify-apis'
import { useAccount, useSigner } from 'wagmi'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import Button from '@/components/common/Button'
import { Advisor } from '@/config'
import { findToken } from '@/config/tokens'
import { checkAdvisorAddress } from '@/funcs/helper'
import { useApplyToken, usePaymentAmount } from '@/hooks/useApplyToken'
import PaymentOptions from '@/pages/web/tokenApply/PaymentOptions'
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
  const [paymentToken, setPaymentToken] = useState<string>('')
  const balances = useBalancesStore((state) => state.balances)
  const [paymentAmount] = usePaymentAmount(paymentToken, 5000)

  const balance = useMemo(() => balances?.[paymentToken] ?? 0, [paymentToken, balances])

  const disabled = useMemo(() => {
    return !signer || isET(balance, 0) || isLT(balance, config.amount)
  }, [signer, balance])

  const tokenInfo = useMemo(() => findToken(paymentToken), [paymentToken])

  const func = useCallback(async () => {
    setLoading(true)

    try {
      await form.validate()

      const toast = window.toast.loading(t('common.pending'))

      const { advisor, marginName, marginToken, marginSymbol, paymentToken, paymentAmount } = form.getFieldsValue([
        'advisor',
        'marginName',
        'marginToken',
        'marginSymbol',
        'paymentToken',
        'paymentAmount'
      ])

      const status = await applyNewMarginToken({
        marginToken,
        paymentToken,
        paymentAmount,
        advisorAddress: advisor,
        signer
      })

      if (status) {
        await applyMarginToken({
          name: marginName,
          symbol: marginSymbol,
          advisor,
          applicant: address,
          paymentToken,
          paymentAmount,
          marginToken
        })

        window.toast.success(t('common.success'))

        form.resetFields()
      } else {
        window.toast.error(t('common.failed'))
      }

      setLoading(false)

      window.toast.dismiss(toast)
    } catch (error) {
      setLoading(false)
    }
  }, [signer])

  useEffect(() => {
    form.setFieldValue('paymentAmount', paymentAmount)
  }, [paymentAmount])

  return (
    <section className="web-user-apply-margin">
      <Form form={form} layout="vertical" autoComplete="off">
        <FormItem field="marginName" rules={[{ required: true, message: t('Apply.Required') }]}>
          <Input prefix={t('Apply.Name')} />
        </FormItem>
        <FormItem field="marginSymbol" rules={[{ required: true, message: t('Apply.Required') }]}>
          <Input prefix={t('Apply.Symbol')} />
        </FormItem>
        <FormItem field="marginToken" rules={[{ required: true, message: t('Apply.Required') }]}>
          <Input prefix={t('Apply.Address')} />
        </FormItem>
        <FormItem field="paymentToken">
          <PaymentOptions onChange={setPaymentToken} />
        </FormItem>
        <FormItem field="paymentAmount">
          <Input prefix={t('Apply.Fee')} readOnly />
        </FormItem>
        <FormItem
          field="advisor"
          rules={[
            {
              validator: async (value, callback) => {
                if (!value) {
                  return callback(t('Apply.Required'))
                }
                const status = await checkAdvisorAddress(value)
                if (status) {
                  return callback()
                } else {
                  return callback(t('Apply.NotExist'))
                }
              },
              required: true
            }
          ]}
        >
          <Input prefix={t('Apply.Advisor')} />
        </FormItem>
        <div className="form-item-balance">
          <span>{t('Advisor.balance')}</span>
          <span>
            {keepDecimals(balance, tokenInfo?.decimals, true)} {tokenInfo?.symbol}
          </span>
        </div>
        <div className="form-item-tips">
          <a href={Advisor} target="_blank">
            {t('Apply.NoAdvisor')}
          </a>
        </div>
        <Button full onClick={func} loading={isLoading} disabled={disabled}>
          {t('Apply.Pay')}
        </Button>
      </Form>
    </section>
  )
}

export default MarginApply
