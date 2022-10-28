import { BASE_TOKEN_SYMBOL } from '@/config/tokens'

export const Feedback = 'https://discord.com/channels/822422051099902053/827112242449350686'
export const Tutorial = 'https://docs.derify.finance/getting-started/tutorial'
export const Docs = 'https://docs.derify.finance/'
export const WhitePaper = 'https://docs.derify.finance/whitepaper/introduction'
export const TestNet = 'https://test.derify.exchange/'

export const Twitter = 'https://twitter.com/DerifyProtocol'
export const Telegram = 'https://t.me/DerifyProtocol_Official'
export const Discord = 'https://discord.gg/kSR6tz2pdm'
export const Medium = 'https://derify.medium.com/'
export const Github = 'https://github.com/derivationlab'

export const Communitys: Record<string, string> = {
  Twitter,
  Telegram,
  Discord,
  Medium,
  Github
}

export const FaucetLinks: Record<string, string> = {
  [BASE_TOKEN_SYMBOL]:
    'https://docs.google.com/forms/d/e/1FAIpQLSesoXfNkoXbF9KoDf_cCq-CqND4xD62GLVcf2F1jUGk3D3WZA/viewform',
  rETH: 'https://www.rinkeby.io/#faucet',
  BNB: 'https://testnet.binance.org/faucet-smart'
}
