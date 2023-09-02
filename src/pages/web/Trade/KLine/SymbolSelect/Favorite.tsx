import { useAtomValue } from 'jotai'
import { useAccount } from 'wagmi'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { favoriteTradingPairs } from '@/api'
import { traderFavoriteAtom } from '@/atoms/useTraderFavorite'
import Image from '@/components/common/Image'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { Rec } from '@/typings'
import emitter, { EventTypes } from '@/utils/emitter'

interface Props {
  data: Rec
}

const Favorite = ({ data }: Props) => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { name, token, derivative, price_decimals } = data
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const traderFavorite = useAtomValue(traderFavoriteAtom)

  const find = useMemo(() => {
    const find = traderFavorite.find((t) => t.name === name)
    return [find ? 'star-fill.svg' : 'star.svg', Boolean(find)]
  }, [traderFavorite])

  const func = async (event: any) => {
    if (typeof event?.stopPropagation === 'function') event.stopPropagation()
    try {
      const params = {
        name,
        token,
        trader: address,
        operation: find[1] ? 'delete' : 'add',
        derivative,
        marginToken: marginToken.address,
        price_decimals
      }
      const data = await favoriteTradingPairs(params)
      if (data.code === 0) emitter.emit(EventTypes.updateTraderFavorite)
    } catch (e) {
      window.toast.error(t('common.Error'))
    }
  }

  return <Image src={`icon/${find[0]}`} onClick={func} />
}

export default Favorite
