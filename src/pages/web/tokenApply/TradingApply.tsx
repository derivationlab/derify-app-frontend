import { Form, Input } from '@arco-design/web-react'
import { useSigner } from 'wagmi'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import Button from '@/components/common/Button'
import { findToken } from '@/config/tokens'
import { useApplyToken, usePaymentAmount } from '@/hooks/useApplyToken'
import MarginOptions from '@/pages/web/tokenApply/MarginOptions'
import PaymentOptions from '@/pages/web/tokenApply/PaymentOptions'
import TokenOptions from '@/pages/web/tokenApply/TokenOptions'
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
  const [marginToken, setMarginToken] = useState<string>('')
  const [paymentToken, setPaymentToken] = useState<string>('')
  const paymentAmount = usePaymentAmount(paymentToken, 200)
  const balances = useBalancesStore((state) => state.balances)

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
      const { marginToken, tradingToken, paymentToken, paymentAmount } = form.getFieldsValue([
        'marginToken',
        'tradingToken',
        'paymentToken',
        'paymentAmount'
      ])
      console.info({
        marginToken,
        paymentToken,
        tradingToken,
        paymentAmount,
        signer
      })

      const status = await applyNewTradingToken({
        marginToken,
        paymentToken,
        paymentAmount,
        tradingToken,
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
      <Form form={form} layout="vertical" autoComplete="off">
        <FormItem field="marginToken" rules={[{ required: true, message: t('Apply.Required') }]}>
          <MarginOptions onChange={setMarginToken} />
        </FormItem>
        <FormItem field="tradingToken" rules={[{ required: true, message: t('Apply.Required') }]}>
          <TokenOptions onChange={() => null} marginToken={marginToken} />
        </FormItem>
        <FormItem field="paymentToken">
          <PaymentOptions onChange={setPaymentToken} />
        </FormItem>
        <FormItem field="paymentAmount">
          <Input prefix={t('Apply.Fee')} readOnly />
        </FormItem>
        <div className="form-item-balance">
          <span>{t('Advisor.balance')}</span>
          <span>
            {keepDecimals(balance, tokenInfo?.decimals, true)} {tokenInfo?.symbol}
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
