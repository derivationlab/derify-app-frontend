import { QUOTE_TOKENS } from '@/config/tokens'

let OUTPUT = {}

QUOTE_TOKENS.forEach((t) => {
  OUTPUT = { ...OUTPUT, [`${t.symbol}USD`]: t.tokenAddress }
})

export const SelectSymbolOptions = ['All Derivatives', ...Object.keys(OUTPUT)]

export const SelectSymbolTokens: Record<string, string> = {
  'All Derivatives': 'all',
  ...OUTPUT
}
