export const timeLineOptions = ['7D', '1M', '3M', '1Y', 'ALL']
export const matchTimeLineOptions: Record<string, any> = {
  '7D': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
  ALL: 1000
}

export const KLineTimes = [
  { label: '1m', value: 60 * 1000 },
  { label: '5m', value: 5 * 60 * 1000 },
  { label: '15m', value: 15 * 60 * 1000 },
  { label: '1h', value: 60 * 60 * 1000 },
  { label: '4h', value: 4 * 60 * 60 * 1000 },
  { label: '1D', value: 24 * 60 * 60 * 1000 },
  { label: '1W', value: 7 * 24 * 60 * 60 * 1000 },
  { label: '1M', value: 30 * 24 * 60 * 60 * 1000 }
]
