import { EventEmitter } from 'fbemitter'

export default new EventEmitter()

export enum EventTypes {
  updateTraderFavorite = 'UPDATE_TRADER_FAVORITE',
  updateTraderVariables = 'UPDATE_TRADER_VARIABLES'
}
