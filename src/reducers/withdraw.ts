interface ActionType {
  type: 'SET_MARGIN_DAT' | 'SET_NECESSARY'
  payload: any
}

interface StateType {
  marginDAT: { disabled: boolean; amount: string }
  necessary: Record<string, any>
}

const stateInit: StateType = {
  marginDAT: { disabled: false, amount: '0' },
  necessary: {}
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_MARGIN_DAT':
      return { ...state, marginDAT: { ...state.marginDAT, ...action.payload } }
    case 'SET_NECESSARY':
      return { ...state, necessary: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
