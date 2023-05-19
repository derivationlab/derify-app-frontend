import { BigNumberish } from '@ethersproject/bignumber'
import { formatUnits as _formatUnits } from '@ethersproject/units'
import BN from 'bignumber.js'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import { ethers } from 'ethers'

dayjs.extend(utc)
dayjs.extend(duration)

export const dayjsStartOf = (): string => dayjs().utc().startOf('days').format()

export const calcDateDuration = (s: number): [number, string, string, string, boolean] => {
  const duration = dayjs.duration(dayjs(s).diff(dayjs()))
  // console.info(duration.asSeconds())
  const days = duration.days()
  const hours = String(duration.hours()).padStart(2, '0')
  const minutes = String(duration.minutes()).padStart(2, '0')
  const seconds = String(duration.seconds()).padStart(2, '0')

  const over = Math.floor(duration.asSeconds()) <= 0

  return over ? [0, '0', '0', '0', true] : [days, hours, minutes, seconds, false]
}

export const toType = (obj: any): string => {
  // @ts-ignore
  return {}.toString
    .call(obj)
    .match(/\s([a-zA-Z]+)/)[1]
    .toLowerCase()
}

export const copyText = (text: string) => {
  return new Promise((resolve, reject) => {
    try {
      const input = document.createElement('textarea')
      input.value = text
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input?.parentElement?.removeChild(input)
      resolve(text)
    } catch (e) {
      reject(e)
    }
  })
}

export const isMobile = (): boolean => {
  return (
    navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    ) != null
  )
}

export const px2rem = (px: number | string): string => {
  return `${String(Number(px) / 100)}rem`
}

export const num2size = (num: number | string): string => {
  return isMobile() ? px2rem(num) : `${String(num)}px`
}

export const sleep = async (time: number): Promise<any> => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export const getMaxZIndex = (): number => {
  // @ts-ignore
  return [...document.getElementsByTagName('*')].reduce(
    (r, e) => Math.max(r, +window.getComputedStyle(e).zIndex || 0),
    0
  )
}

export const calcShortHash = (hash: string, before?: number, end?: number) => {
  const reg = new RegExp(`(\\w{${before ?? 15}})\\w*(\\w{${end ?? 15}})`)
  return hash.replace(reg, '$1...$2')
}

export const formatUnits = (value: BigNumberish, precision = 8): string => {
  return _formatUnits(value, precision)
}

export const keepDecimals = (value: string | number, decimal = 2, format = false): string => {
  const base = String(value)
  const _value = base.indexOf('.') > -1 ? base : `${base}.0`
  const [a, b] = _value.split('.')
  const padEnd = decimal > b.length ? b.padEnd(decimal, '0') : b
  const substr = `${a}.${padEnd.substring(0, decimal)}`
  return format ? thousandthsDivision(substr) : substr
}

export const thousandthsDivision = (n: string | number) => {
  return n.toString().replace(/\d+/, (m) => m.replace(/(\d)(?=(\d{3})+$)/g, ($1) => $1 + ','))
}

export const safeInterceptionValues = (value: BigNumberish, decimal = 2, precision = 8): string => {
  const isDecimal = Object.prototype.toString.call(value) === '[object String]' && String(value).includes('.')
  const regexp = /(?:\.0*|(\.\d+?)0+)$/
  const _value = isDecimal ? (value as string) : _formatUnits(value, precision)
  const _split = _value.split('.')
  const handle = `${_split[0]}.${_split[1].substring(0, decimal)}`
  return handle.replace(regexp, '$1')
}

export const nonBigNumberInterception = (value: string | number, decimal = 2): string => {
  const base = String(value)
  return safeInterceptionValues(base.indexOf('.') > -1 ? base : `${base}.0`, decimal)
}

export const inputParameterConversion = (amount: number | string, precision = 8): string => {
  const p1 = String(amount)
  const p2 = p1.indexOf('.') > -1 ? p1 : `${p1}.0`
  const [int, dec] = p2.split('.')
  const p3 = `${int}.${dec.substring(0, precision)}`
  return ethers.utils.parseUnits(p3, precision).toString()
}

export const isGT = (a: string | number, b: string | number): boolean => {
  return new BN(a).isGreaterThan(b)
}

export const isLT = (a: string | number, b: string | number): boolean => {
  return new BN(a).isLessThan(b)
}

export const isET = (a: string | number, b: string | number): boolean => {
  return new BN(a).isEqualTo(b)
}

export const bnMul = (a: string | number, b: string | number): string => {
  return new BN(a).times(b).toString()
}

export const bnDiv = (a: string | number, b: string | number): string => {
  return new BN(a).div(b).toString()
}

export const bnAbs = (a: string | number): string => {
  return new BN(a).abs().toString()
}

export const isLTET = (a: string | number, b: string | number): boolean => {
  return new BN(a).isLessThanOrEqualTo(b)
}

export const isGTET = (a: string | number, b: string | number): boolean => {
  return new BN(a).isGreaterThanOrEqualTo(b)
}

export const bnPlus = (a: string | number, b: string | number): string => {
  return new BN(a).plus(b).toString()
}

export const bnMinus = (a: string | number, b: string | number): string => {
  return new BN(a).minus(b).toString()
}
