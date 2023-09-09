import { useInitData } from '@/pages/web/Dashboard/BuybackPlan/hooks'

import Data from './Data'
import Plan from './Plan'

const BuybackPlan = () => {
  const { tokenPrice, buyBackInfo, marginPrices, blockNumber } = useInitData()

  return (
    <div className="web-dashboard">
      <Data tokenPrice={tokenPrice} blockNumber={blockNumber} buyBackInfo={buyBackInfo} marginPrices={marginPrices} />
      <Plan tokenPrice={tokenPrice} blockNumber={blockNumber} buyBackInfo={buyBackInfo} marginPrices={marginPrices} />
    </div>
  )
}

export default BuybackPlan
