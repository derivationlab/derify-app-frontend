import PubSub from 'pubsub-js'
import { useAccount, useSigner } from 'wagmi'

import React, { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import Button from '@/components/common/Button'
import IsItConnected from '@/components/web/IsItConnected'
import { useTokenMint } from '@/hooks/useTokenMint'
import MarginToken from '@/pages/web/Faucet/MarginToken'
import { useMarginTokenListStore } from '@/store'
import { PubSubEvents, Rec } from '@/typings'

const mintAmount: Rec = {
  USDT: 10000,
  DRF: 10000,
  BUSD: 10000,
  xx: 10000,
  BTC: 2100,
  PIG: 100000000000,
  CAKE: 75000,
  XVS: 3000
}

const FaucetInner: FC = () => {
  const { t } = useTranslation()
  const { connector } = useAccount()
  const { data: signer } = useSigner()
  const { mint } = useTokenMint()
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const [isLoading, setLoading] = useBoolean(false)
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

  const _register = useCallback(async () => {
    if (connector) {
      const { logo: image, symbol, margin_token: address } = mintToken
      await connector.watchAsset?.({ address, symbol, image })
    }
  }, [mintToken, connector])

  return (
    <div className="web-faucet">
      <section className="web-faucet-inner">
        <MarginToken onSelect={setMintToken} />
        <Button className="mint-btn" full onClick={_mint} loading={isLoading} disabled={!signer}>
          Mint
        </Button>
        <Button full onClick={_register}>
          {t('Nav.AddToken.Add', { token: mintToken?.symbol })}
        </Button>
        <a href="https://testnet.binance.org/faucet-smart" target="_blank">
          Get testnet tBNB from official faucet
        </a>
      </section>
    </div>
  )
}

const Faucet = () => {
  return (
    <IsItConnected>
      <FaucetInner />
    </IsItConnected>
  )
}

export default Faucet
