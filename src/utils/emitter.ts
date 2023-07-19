import { EventEmitter } from 'fbemitter'

export default new EventEmitter()

export enum EventTypes {
  updateTraderVariables = 'UPDATE_TRADER_VARIABLES'
}
