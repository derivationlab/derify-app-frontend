import { DEFAULT_MARGIN_TOKEN } from '@/config/tokens'

export const Docs = 'https://docs.derify.finance/'
export const Tutorial = 'https://docs.derify.finance/getting-started/tutorial'
export const WhitePaper = 'https://docs.derify.finance/whitepaper/introduction'
export const Medium = 'https://derify.medium.com/'
export const Github = 'https://github.com/derivationlab'
export const Discord = 'https://discord.gg/kSR6tz2pdm'
export const Twitter = 'https://twitter.com/DerifyProtocol'
export const Telegram = 'https://t.me/DerifyProtocol_Official'

export const Communitys: Record<string, string> = {
  Twitter,
  Telegram,
  Discord,
  Medium,
  Github
}

export const FaucetLinks: Record<string, string> = {
  [DEFAULT_MARGIN_TOKEN.symbol]:
    'https://docs.google.com/forms/d/e/1FAIpQLSesoXfNkoXbF9KoDf_cCq-CqND4xD62GLVcf2F1jUGk3D3WZA/viewform',
  rETH: 'https://www.rinkeby.io/#faucet',
  BNB: 'https://testnet.binance.org/faucet-smart'
}
