import pairs from '@/config/pairs'

let combine = {}

pairs.forEach((pair) => {
  combine = { ...combine, [pair.name]: pair.token }
})
console.info(combine)
export const SymbolTokens: Record<string, string> = combine

export const SymbolOptions = Object.keys(SymbolTokens)

export const SelectSymbolOptions = ['All Derivatives', ...SymbolOptions]

export const SymbolTokensOptions: Record<string, any>[] = SymbolOptions.map((name: string) => ({
  name,
  token: SymbolTokens[name]
}))

export const SelectSymbolTokens: Record<string, string> = {
  'All Derivatives': 'all',
  ...SymbolTokens
}
