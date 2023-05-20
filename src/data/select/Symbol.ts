import { QUOTE_TOKENS } from '@/config/tokens'

function output() {
  let _ = Object.create(null)
  QUOTE_TOKENS.forEach((t) => {
    _ = { ..._, [`${t.symbol}USD`]: t.tokenAddress }
  })
  return _
}

export const pairOptions = QUOTE_TOKENS.map((t) => ({
  label: `${t.symbol}USD`,
  value: t.symbol
}))
