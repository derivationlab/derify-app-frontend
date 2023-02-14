interface ActionType {
  type: 'SET_OPENING_AMOUNT' | 'SET_TOKEN_SELECT' | 'SET_MODAL_STATUS' | 'SET_OPENING_PARAMS'
  payload: any
}

interface StateType {
  tokenSelect: string
  modalStatus: boolean
  openingAmount: string
  openingParams: Record<string, any>
}

const stateInit: StateType = {
  tokenSelect: '',
  modalStatus: false,
  openingAmount: '',
  openingParams: {}
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_OPENING_AMOUNT':
      return { ...state, openingAmount: action.payload }
    case 'SET_TOKEN_SELECT':
      return { ...state, tokenSelect: action.payload }
    case 'SET_MODAL_STATUS':
      return { ...state, modalStatus: action.payload }
    case 'SET_OPENING_PARAMS':
      return { ...state, openingParams: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
