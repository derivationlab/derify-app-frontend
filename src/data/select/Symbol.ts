import { getBTCAddress, getETHAddress } from '@/utils/addressHelpers'

export const SymbolTokens: Record<string, string> = {
  'BTC-BUSD': getBTCAddress(),
  'ETH-BUSD': getETHAddress()
}

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
