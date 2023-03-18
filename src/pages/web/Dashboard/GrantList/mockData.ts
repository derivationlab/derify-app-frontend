const MarginDataFunc = () => {
  return [...new Array(20)].map((_, index) => ({
    value: index + 1,
    label: 'BUSD',
    icon: 'icon/bnb.svg',
    price: 123.422 * (index + 1),
    decimals: (index % 3) + 2
  }))
}
const allItem = { value: '', label: 'All' }
export const MarginData = [allItem, ...MarginDataFunc()]
export const MarginNoAllData = [...MarginDataFunc()]

export const TargetData = [
  allItem,
  {
    value: 1,
    label: 'Position Mining'
  },
  {
    value: 2,
    label: 'Broker'
  },
  {
    value: 3,
    label: 'Trading Competition'
  }
]

export const StateData = [
  allItem,
  {
    value: 1,
    label: 'Upcoming'
  },
  {
    value: 2,
    label: 'Active'
  },
  {
    value: 3,
    label: 'Closed'
  }
]

const GrantListFunc = () => {
  return [...new Array(8)].map((_, index) => {
    const temp = index % 3
    return {
      value: index + 1,
      Margin: 'BUSD',
      MarginIcon: 'icon/bnb.svg',
      Target: temp === 0 ? TargetData[1].label : temp === 1 ? TargetData[2].label : TargetData[3].label,
      State: temp === 0 ? StateData[1].label : temp === 1 ? StateData[2].label : StateData[3].label,
      Rewards: 1234567.9867,
      StartTime: +new Date() - 100000000,
      EndTime: +new Date()
    }
  })
}
export const GrantListData = GrantListFunc()
