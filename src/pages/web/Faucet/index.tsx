import PubSub from 'pubsub-js'
import { useAccount, useSigner } from 'wagmi'

import React, { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import { FaucetLinks } from '@/config'
import { useTokenMint } from '@/hooks/useTokenMint'
import MarginToken from '@/pages/web/Faucet/MarginToken'
import { PubSubEvents, Rec } from '@/typings'

const mintAmount: Rec = {
  USDT: 10000,
  DRF: 10000,
  BUSD: 10000,
  BTC: 2100,
  PIG: 100000000000,
  CAKE: 75000,
  XVS: 3000
}

const Faucet: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const { mint } = useTokenMint()
  const [isLoading, setLoading] = useBoolean(false)
  const [mintToken, setMintToken] = useState<Rec>({})

  const _mint = useCallback(async () => {
    setLoading(true)
    const toast = window.toast.loading(t('common.pending'))
    const { symbol = '', margin_token = '' } = mintToken
    const status = await mint(margin_token, mintAmount[symbol], signer)
    if (status) {
      window.toast.success(t('common.success'))
      PubSub.publish(PubSubEvents.UPDATE_BALANCE)
    } else {
      window.toast.error(t('common.failed'))
    }
    setLoading(false)
    window.toast.dismiss(toast)
  }, [signer])

  if (!address) {
    return (
      <div className="web-broker-not-connect">
        <NotConnect />
      </div>
    )
  }

  return (
    <div className="web-faucet">
      <section className="web-faucet-inner">
        <MarginToken onSelect={setMintToken} />
        <Button full onClick={_mint} loading={isLoading}>
          Mint
        </Button>
        <a href={FaucetLinks.BNB} target="_blank">
          Get testnet tBNB from official faucet
        </a>
      </section>
    </div>
  )
}

export default Faucet
