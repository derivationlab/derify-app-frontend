import { Address } from 'abitype'

export const addToken = async (address: Address, symbol: string, decimals: number, image: string): Promise<boolean> => {
  if (window?.ethereum?.request) {
    const status = await window.ethereum?.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          image,
          symbol,
          address: address,
          decimals: decimals
        }
      }
    })
    return status
  }
  return false
}
