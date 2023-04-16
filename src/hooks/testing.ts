import { getBep20Contract, getDerifyProtocolContract } from '@/utils/contractHelpers'

export const testingFunc = async () => {
  try {
    const c = getBep20Contract('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
    // const response1 = await c.symbol()
    const response2 = await c.balanceOf('0x99dCa03F94734E2C3e34C7EeaaDd4168147e5a5e')
    // console.info(String(response1))
    console.info(String(response2))
  } catch (e) {
    console.info(e)
  }
}
