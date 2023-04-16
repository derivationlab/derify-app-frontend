interface ActionType {
  type: 'SET_IN_AMOUNT' | 'SET_BALANCE' | 'SET_DISABLED'
  payload: any
}

interface StateType {
  balance: string
  inAmount: string
  disabled: boolean
}

const stateInit: StateType = {
  balance: '0',
  inAmount: '0',
  disabled: false
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_BALANCE':
      return { ...state, balance: action.payload }
    case 'SET_IN_AMOUNT':
      return { ...state, inAmount: action.payload }
    case 'SET_DISABLED':
      return { ...state, disabled: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
