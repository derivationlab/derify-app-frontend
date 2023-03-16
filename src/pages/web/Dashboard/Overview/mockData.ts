const MarketInfoDataFunc = () => {
  return [...new Array(20)].map((_, index) => ({
    id: index + 1,
    name: 'BUSD',
    icon: 'icon/bnb.svg',
    maxApy: 234.56,
    tradingVolume: 111119.22,
    positionVolume: 12345.22,
    buybackPool: 1245.22
  }))
}
export const MarketInfoData = MarketInfoDataFunc()
