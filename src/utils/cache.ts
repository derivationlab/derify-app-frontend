import { isNumber } from 'lodash-es'
import store from 'store'

import { toType } from './tools'

export const get = (key: string) => {
  const cacheData = store.get(key)
  if (cacheData == null) {
    return null
  }

  if (toType(cacheData) !== 'object') {
    return cacheData
  }
  if (cacheData.tool && cacheData.tool === 'localstore') {
    if (isNumber(cacheData.expiryTime) && isNumber(cacheData.cacheTime)) {
      const now = +new Date()
      if (now - cacheData.cacheTime >= cacheData.expiryTime) {
        return null
      } else {
        return cacheData.value
      }
    } else {
      return cacheData.value
    }
  } else {
    return cacheData
  }
}
// time: cache time, unix is hour
export const set = (key: string, value: any, time?: number) => {
  const data: Record<string, any> = { value, type: toType(value), tool: 'localstore' }
  if (time) {
    if (!isNumber(time)) {
      throw new Error('only number')
    }
    data.cacheTime = +new Date()
    data.expiryTime = time * 60 * 60 * 1000
  }
  store.set(key, data)
}

export const rm = (key: string) => {
  return store.remove(key)
}

export const clear = () => {
  store.clearAll()
}

export default {
  get,
  set,
  rm,
  clear
}
