interface ActionType {
  type: 'SET_AMOUNT' | 'SET_LOADING' | 'SET_PAY_COIN' | 'SET_SLIPPAGE'
  payload: any
}

interface StateType {
  amount: string
  loading: boolean
  payCoin: string
  slippage: string
}

const stateInit: StateType = {
  amount: '',
  loading: false,
  payCoin: '',
  slippage: ''
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_AMOUNT':
      return { ...state, amount: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_PAY_COIN':
      return { ...state, payCoin: action.payload }
    case 'SET_SLIPPAGE':
      return { ...state, slippage: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
