const PlanDataFunc = () => {
  return [...new Array(20)].map((_, index) => ({
    id: index + 1,
    name: 'BUSD',
    icon: 'icon/bnb.svg',
    buybackPool: 1245.22,
    BuybackCycle: 300000,
    DRFPrice: 1.23,
    RemainingBlock: 1234567,
    EstimatedTime: +new Date() + 1000000000
  }))
}
export const PlanData = PlanDataFunc()
