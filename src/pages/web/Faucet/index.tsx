import PubSub from 'pubsub-js'
import { useAccount, useSigner } from 'wagmi'

import React, { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import { useTokenMint } from '@/hooks/useTokenMint'
import MarginToken from '@/pages/web/Faucet/MarginToken'
import { useMarginTokenListStore } from '@/store'
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
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const [mintToken, setMintToken] = useState<Rec>(marginTokenList[0])

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
  }, [signer, mintToken])

  return !address ? (
    <div className="web-not-connect-container">
      <NotConnect />
    </div>
  ) : (
    <div className="web-faucet">
      <section className="web-faucet-inner">
        <MarginToken onSelect={setMintToken} />
        <Button full onClick={_mint} loading={isLoading} disabled={!signer}>
          Mint
        </Button>
        <a href="https://testnet.binance.org/faucet-smart" target="_blank">
          Get testnet tBNB from official faucet
        </a>
      </section>
    </div>
  )
}

export default Faucet
