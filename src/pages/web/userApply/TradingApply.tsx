import { Form, Input } from '@arco-design/web-react'
import { useAccount, useSigner } from 'wagmi'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import Button from '@/components/common/Button'
import { findToken } from '@/config/tokens'
import { useApplyToken, usePaymentAmount } from '@/hooks/useApplyToken'
import PaymentOptions, { paymentTypeOptionsDef } from '@/pages/web/userApply/PaymentOptions'
import { useBalancesStore } from '@/store'
import { isET, isLT, keepDecimals } from '@/utils/tools'

export const config = {
  amount: 100000,
  period: 365
}
const FormItem = Form.Item

const TradingApply = () => {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { applyNewTradingToken } = useApplyToken()
  const [isLoading, setLoading] = useBoolean(false)
  const [payment, setPayment] = useState<string>(paymentTypeOptionsDef)
  const balances = useBalancesStore((state) => state.balances)
  const paymentAmount = usePaymentAmount(payment, 200)

  const balance = useMemo(() => balances?.[payment] ?? 0, [payment, balances])

  const disabled = useMemo(() => {
    return !signer || isET(balance, 0) || isLT(balance, config.amount)
  }, [signer, balance])

  const tokenInfo = useMemo(() => findToken(payment), [payment])

  const func = useCallback(async () => {
    setLoading(true)

    try {
      await form.validate()

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

      const status = await applyNewTradingToken({
        marginToken,
        paymentToken: payment,
        paymentAmount,
        tradingToken: '',
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
    } catch (error) {
      setLoading(false)
    }
  }, [signer])

  useEffect(() => {
    form.setFieldValue('paymentAmount', paymentAmount)
  }, [paymentAmount])

  return (
    <section className="web-user-apply-margin">
      <Form form={form} layout="vertical" autoComplete="off" initialValues={{ payment: paymentTypeOptionsDef }}>
        <FormItem field="payment">
          <PaymentOptions onChange={setPayment} />
        </FormItem>
        <FormItem field="paymentAmount">
          <Input prefix={t('Apply.Fee')} readOnly />
        </FormItem>
        <div className="form-item-balance">
          <span>{t('Advisor.balance')}</span>
          <span>
            {keepDecimals(balance, tokenInfo.decimals, true)} {tokenInfo.symbol}
          </span>
        </div>
        <Button full onClick={func} loading={isLoading} disabled={disabled}>
          {t('Apply.Pay')}
        </Button>
      </Form>
    </section>
  )
}

export default TradingApply
