import { DEFAULT_MARGIN_TOKEN } from '@/config/tokens'

interface ActionType {
  type:
    | 'SET_DISABLED'
    | 'SET_GRANT_DAYS'
    | 'SET_CLIFF_DAYS'
    | 'SET_AMOUNT_INP'
    | 'SET_MARGIN_TOKEN'
    | 'SET_GRANT_TARGET'
  payload: any
}

interface StateType {
  disabled: boolean
  grantDays: number
  cliffDays: number
  amountInp: string
  marginToken: string
  grantTarget: string
}

export const all = { value: '', label: 'ALL' }

export const grantTargetOptions = (needAll = false): Record<string, any>[] => {
  const baseOptions = [
    {
      key: 'mining',
      nick: 'pmr',
      value: 1,
      label: 'Position Mining'
    },
    {
      key: 'awards',
      nick: 'broker_rewards',
      value: 2,
      label: 'Broker'
    },
    {
      key: 'rank',
      nick: 'rank',
      value: 3,
      label: 'Trading Competition'
    }
  ]
  if (!needAll) return baseOptions
  return [all, ...baseOptions]
}

const stateInit: StateType = {
  disabled: false,
  grantDays: 1,
  cliffDays: 0,
  amountInp: '',
  marginToken: DEFAULT_MARGIN_TOKEN.symbol,
  grantTarget: grantTargetOptions()[0].value
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_DISABLED':
      return { ...state, disabled: action.payload }
    case 'SET_GRANT_DAYS':
      return { ...state, grantDays: action.payload }
    case 'SET_CLIFF_DAYS':
      return { ...state, cliffDays: action.payload }
    case 'SET_AMOUNT_INP':
      return { ...state, amountInp: action.payload }
    case 'SET_MARGIN_TOKEN':
      return { ...state, marginToken: action.payload }
    case 'SET_GRANT_TARGET':
      return { ...state, grantTarget: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
