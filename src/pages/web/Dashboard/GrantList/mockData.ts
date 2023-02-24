const MarginDataFunc = () => {
  return [...new Array(20)].map((_, index) => ({
    value: index + 1,
    label: 'BUSD',
    icon: 'icon/bnb.svg'
  }))
}
const allItem = { value: '', label: 'All' }
export const MarginData = [allItem, ...MarginDataFunc()]

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
