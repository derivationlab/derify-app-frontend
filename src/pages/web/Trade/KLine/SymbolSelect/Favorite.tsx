import { useAtomValue } from 'jotai'
import { useAccount } from 'wagmi'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { favoriteTradingPairs } from '@/api'
import { traderFavoriteAtom } from '@/atoms/useTraderFavorite'
import Image from '@/components/common/Image'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import emitter, { EventTypes } from '@/utils/emitter'

interface Props {
  token: string
}

const Favorite = ({ token }: Props) => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const traderFavorite = useAtomValue(traderFavoriteAtom)

  const find = useMemo(() => {
    const find = traderFavorite.find((t) => t === token)
    return [find ? 'star-fill.svg' : 'star.svg', Boolean(find)]
  }, [token, traderFavorite])

  const func = async (event: any) => {
    if (typeof event?.stopPropagation === 'function') event.stopPropagation()
    try {
      const params = {
        token,
        trader: address,
        operation: find[1] ? 'delete' : 'add',
        marginToken: marginToken.address
      }
      const data = await favoriteTradingPairs(params)
      if (data.code === 0) emitter.emit(EventTypes.updateTraderFavorite)
    } catch (e) {
      window.toast.error(t('common.Frequently'))
    }
  }

  return <Image src={`icon/${find[0]}`} onClick={func} />
}

export default Favorite
