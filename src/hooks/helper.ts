import BN from 'bignumber.js'
import { BigNumberish } from '@ethersproject/bignumber'
import { chunk, flatten, isEmpty } from 'lodash'

import multicall from '@/utils/multicall'
import contracts from '@/config/contracts'
import { OpeningType } from '@/zustand/useCalcOpeningDAT'
import { PositionSide } from '@/typings'
import { findMarginToken, MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import {
  getDerifyBrokerContract,
  getDerifyDerivativePairContract,
  getDerifyExchangeContract,
  getDerifyProtocolContract,
  getDerifyRewardsContract
} from '@/utils/contractHelpers'
import { MarginToken, MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'
import {
  bnDiv,
  formatUnits,
  inputParameterConversion,
  isGT,
  isLT,
  nonBigNumberInterception,
  safeInterceptionValues
} from '@/utils/tools'

import DerifyFactoryAbi from '@/config/abi/DerifyFactory.json'
import DerifyRewardsAbi from '@/config/abi/DerifyRewards.json'
import DerifyExchangeAbi from '@/config/abi/DerifyExchange.json'
import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import MarginTokenPriceFeedAbi from '@/config/abi/MarginTokenPriceFeed.json'
import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'

export const initialFactoryConfig = (): MarginTokenWithQuote => {
  let value = Object.create(null)
  let quote = Object.create(null)

  QUOTE_TOKENS.forEach((t) => {
    quote = {
      ...quote,
      [t.symbol]: ''
    }
  })
  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: quote
    }
  })

  return value
}

export const getFactoryConfig = async (p: MarginTokenWithContract): Promise<MarginTokenWithQuote> => {
  const output = initialFactoryConfig()

  const calls = flatten(
    Object.keys(p).map((key) =>
      QUOTE_TOKENS.map((t) => ({
        name: 'getDerivative',
        params: [t.tokenAddress],
        address: p[key as MarginTokenKeys].factory,
        quoteToken: t.symbol as QuoteTokenKeys,
        marginToken: key as MarginTokenKeys
      }))
    )
  )

  const response = await multicall(DerifyFactoryAbi, calls)

  if (!isEmpty(response)) {
    response.forEach(([address]: string[], index: number) => {
      const { marginToken, quoteToken } = calls[index]
      output[marginToken] = { ...output[marginToken], [quoteToken]: address }
    })
    // console.info(output)
    return output
  }

  return output
}

export const initialOpeningMinLimit = (): MarginToken => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: '0'
    }
  })

  return value
}

export const getOpeningMinLimit = async (p: MarginTokenWithContract): Promise<MarginToken> => {
  let output = initialOpeningMinLimit()

  const calls = Object.keys(p).map((key) => ({
    name: 'minOpenAmount',
    address: p[key as MarginTokenKeys].exchange,
    marginToken: key as MarginTokenKeys
  }))

  const response = await multicall(DerifyExchangeAbi, calls)

  if (!isEmpty(response)) {
    response.forEach((limit: BigNumberish, index: number) => {
      const { marginToken } = calls[index]
      output = {
        ...output,
        [marginToken]: safeInterceptionValues(String(limit), 8)
      }
    })
    // console.info(output)
    return output
  }

  return output
}

export const getMarginTokenPrice = async (p: MarginTokenWithContract): Promise<MarginToken> => {
  let output = initialOpeningMinLimit()

  const calls = Object.keys(p).map((key) => ({
    name: 'getMarginTokenPrice',
    address: p[key as MarginTokenKeys].priceFeed,
    marginToken: key as MarginTokenKeys
  }))

  const response = await multicall(MarginTokenPriceFeedAbi, calls)

  if (!isEmpty(response)) {
    response.forEach((limit: BigNumberish, index: number) => {
      const { marginToken } = calls[index]
      output = {
        ...output,
        [marginToken]: safeInterceptionValues(String(limit), 8)
      }
    })
    // console.info(output)
    return output
  }

  return output
}

// todo debug token precision
// export const getMarginTokenPrecision = async (p: MarginTokenWithContract): Promise<MarginToken> => {
//   let output = initialOpeningMinLimit()
//
//   const calls = Object.keys(p).map((key) => ({
//     name: 'getMarginTokenDecimals',
//     address: p[key as MarginTokenKeys].priceFeed,
//     marginToken: key as MarginTokenKeys
//   }))
//
//   const response = await multicall(MarginTokenPriceFeedAbi, calls)
//
//   if (!isEmpty(response)) {
//     response.forEach((limit: BigNumberish, index: number) => {
//       const { marginToken } = calls[index]
//       output = {
//         ...output,
//         [marginToken]: safeInterceptionValues(String(limit), 8)
//       }
//     })
//     console.info(output)
//     return output
//   }
//
//   return output
// }

export const initialTraderVariables = {
  balance: '0',
  marginRate: '0',
  totalMargin: '0',
  marginBalance: '0',
  availableMargin: '0',
  totalPositionAmount: '0'
}

export type InitialTraderVariablesType = typeof initialTraderVariables

export const getTraderVariables = async (trader: string, exchange: string): Promise<InitialTraderVariablesType> => {
  const calls = [
    {
      name: 'getTraderAccount',
      address: exchange,
      params: [trader]
    },
    {
      name: 'getTraderVariables',
      address: exchange,
      params: [trader]
    }
  ]

  try {
    const response = await multicall(DerifyExchangeAbi, calls)

    if (!isEmpty(response)) {
      const [getTraderAccount, getTraderVariables] = response
      const { balance, totalMargin, availableMargin } = getTraderAccount
      const { marginRate, marginBalance, totalPositionAmount } = getTraderVariables

      return {
        balance: safeInterceptionValues(balance),
        marginRate: safeInterceptionValues(marginRate, 4),
        totalMargin: safeInterceptionValues(totalMargin),
        marginBalance: safeInterceptionValues(marginBalance),
        availableMargin: safeInterceptionValues(availableMargin, 8),
        totalPositionAmount: safeInterceptionValues(totalPositionAmount)
      }
    }

    return initialTraderVariables
  } catch (e) {
    // console.info(e)
    return initialTraderVariables
  }
}

export const initialOpeningMaxLimit = (): MarginTokenWithQuote => {
  let value = Object.create(null)
  let quote = Object.create(null)

  QUOTE_TOKENS.forEach((t) => {
    quote = {
      ...quote,
      [t.symbol]: {
        long: '0',
        short: '0',
        twoWay: '0'
      }
    }
  })
  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: quote
    }
  })

  return value
}

export const getOpeningMaxLimit = async (p: MarginTokenWithContract): Promise<MarginTokenWithQuote> => {
  const output = initialOpeningMaxLimit()

  const calls = flatten(
    Object.keys(p).map((m) => {
      const exchange = p[m as MarginTokenKeys].exchange
      const base = {
        name: 'getSysOpenUpperBound',
        address: exchange,
        marginToken: m
      }
      return flatten(
        QUOTE_TOKENS.map((q) => {
          const quoteToken = q.symbol
          return [
            { ...base, params: [q.tokenAddress, 0], quoteToken },
            { ...base, params: [q.tokenAddress, 1], quoteToken },
            { ...base, params: [q.tokenAddress, 2], quoteToken }
          ]
        })
      )
    })
  )
  // console.info(calls)
  const response = await multicall(DerifyExchangeAbi, calls)
  // console.info(response)
  if (!isEmpty(response)) {
    response.forEach((limit: BigNumberish, index: number) => {
      const { marginToken, quoteToken } = calls[index]
      output[marginToken as MarginTokenKeys] = {
        ...output[marginToken as MarginTokenKeys],
        [quoteToken]: {
          ...output[marginToken as MarginTokenKeys][quoteToken as QuoteTokenKeys],
          [PositionSide[calls[index].params[1] as number]]: safeInterceptionValues(String(limit), 8)
        }
      }
    })
    // console.info(output)
    return output
  }

  return output
}

export const calcProfitOrLoss = (TP: number, SL: number): Record<string, any> => {
  if (TP > 0) {
    switch (true) {
      case SL > 0:
        return { method: 'orderStopPosition', stopType: 2 }
      case SL < 0:
        return { method: 'orderAndCancelStopPosition', orderStopType: 0, cancelStopType: 1 }
      default:
        return { method: 'orderStopPosition', stopType: 0 }
    }
  } else if (TP < 0) {
    switch (true) {
      case SL > 0:
        return { method: 'orderAndCancelStopPosition', orderStopType: 1, cancelStopType: 0 }
      case SL < 0:
        return { method: 'cancelOrderedStopPosition', stopType: 2 }
      default:
        return { method: 'cancelOrderedStopPosition', stopType: 0 }
    }
  } else {
    switch (true) {
      case SL > 0:
        return { method: 'orderStopPosition', stopType: 1 }
      case SL < 0:
        return { method: 'cancelOrderedStopPosition', stopType: 1 }
      default:
        return {}
    }
  }
}

export const isOpeningMinLimit = (
  mPrice: string,
  openingMinLimit: string,
  openingAmount: string,
  tokenSelect: string,
  spotPrice: string
): boolean => {
  if (findMarginToken(tokenSelect)) {
    return isLT(Number(openingAmount) * Number(mPrice), openingMinLimit)
  } else {
    const div = Number(openingMinLimit) / Number(spotPrice)
    return isLT(openingAmount, div)
  }
}

export const calcTradingFee = async (
  pairAddress: string,
  tokenSelect: string,
  openingAmount: string | number,
  spotPrice: string
): Promise<number> => {
  const c = getDerifyDerivativePairContract(pairAddress)

  const response = await c.tradingFeeRatio()

  const ratio = Number(safeInterceptionValues(String(response), 8))

  if (findMarginToken(tokenSelect)) {
    return ratio * Number(openingAmount)
  } else {
    const mul = Number(openingAmount) * Number(spotPrice)
    return ratio * mul
  }
}

export const checkOpeningVol = (
  spotPrice: string,
  openingSize: string,
  positionSide: PositionSide,
  openingType: OpeningType,
  tokenSelect: string,
  openingMaxLimit: string
) => {
  if (positionSide === PositionSide.twoWay || openingType !== OpeningType.Market) return openingSize
  if (findMarginToken(tokenSelect)) {
    const mul = Number(spotPrice) * Number(openingMaxLimit)
    return isGT(openingSize, mul) ? mul : openingSize
  } else {
    return isGT(openingSize, openingMaxLimit) ? openingMaxLimit : openingSize
  }
}

export const calcChangeFee = async (
  side: PositionSide,
  symbol: string,
  amount: string | number,
  spotPrice: string,
  exchange: string,
  derivative: string,
  isOpen = false
): Promise<string> => {
  let nakedPositionTradingPairAfterClosing_BN: BN = new BN(0)

  if (side === PositionSide.twoWay) return '0'

  const size = findMarginToken(symbol)
    ? inputParameterConversion(bnDiv(amount, spotPrice), 8)
    : inputParameterConversion(amount, 8)
  const exchangeContract = getDerifyExchangeContract(exchange)
  const derivativeContract = getDerifyDerivativePairContract(derivative)

  const liquidityPool = await exchangeContract.liquidityPool()
  const longTotalSize = await derivativeContract.longTotalSize()
  const shortTotalSize = await derivativeContract.shortTotalSize()
  const kRatio = await derivativeContract.kRatio()
  const gRatio = await derivativeContract.gRatio()
  const roRatio = await derivativeContract.roRatio()
  const beforeRatio = await derivativeContract.getPositionChangeFeeRatio()

  const longTotalSize_BN = new BN(longTotalSize._hex)
  const shortTotalSize_BN = new BN(shortTotalSize._hex)

  const nakedPositionTradingPairBeforeClosing_BN = longTotalSize_BN.minus(shortTotalSize_BN)

  if (side === PositionSide.long) {
    if (!isOpen) nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.minus(size).minus(shortTotalSize_BN)
    else nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.plus(size).minus(shortTotalSize_BN)
  }

  if (side === PositionSide.short) {
    if (!isOpen) nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.minus(shortTotalSize_BN.minus(size))
    else {
      nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.minus(shortTotalSize_BN.plus(size))
    }
  }

  const raw_data_naked_after = safeInterceptionValues(
    String(new BN(safeInterceptionValues(String(nakedPositionTradingPairAfterClosing_BN), 8)).times(spotPrice)),
    8
  )
  const raw_data_naked_before = safeInterceptionValues(
    String(new BN(safeInterceptionValues(String(nakedPositionTradingPairBeforeClosing_BN), 8)).times(spotPrice)),
    8
  )
  const nakedPositionDiff_BN = new BN(raw_data_naked_after).abs().minus(new BN(raw_data_naked_before).abs())

  const raw_data_kRatio = safeInterceptionValues(String(kRatio), 8)
  const minimum = BN.minimum(new BN(liquidityPool._hex).times(raw_data_kRatio), new BN(gRatio._hex))

  const row_data_minimum = safeInterceptionValues(String(minimum), 8)
  const tradingFeeAfterClosing_BN = minimum.isEqualTo(0)
    ? new BN(0)
    : new BN(raw_data_naked_after).div(row_data_minimum)

  const row_data_beforeRatio = safeInterceptionValues(beforeRatio._hex, 8)
  const radioSum = new BN(row_data_beforeRatio).abs().plus(tradingFeeAfterClosing_BN.abs())

  const row_data_roRatio = safeInterceptionValues(roRatio._hex, 8)
  const row_data_naked_final = safeInterceptionValues(String(nakedPositionDiff_BN), 8)
  const fee = new BN(row_data_naked_final).times(radioSum.div(2).plus(row_data_roRatio)).times(-1)

  return nonBigNumberInterception(fee.toFixed(10), 8)
}

export const getTraderRewardDAT = async (trader: string, reward: string): Promise<Record<string, any>> => {
  let output = {}
  const calls = [
    {
      name: 'getPositionReward',
      address: reward,
      params: [trader]
    },
    {
      name: 'getBondInfo',
      address: reward,
      params: [trader]
    },
    {
      name: 'getExchangeBondSizeUpperBound',
      address: reward,
      params: [trader]
    },
    {
      name: 'bankBondPool',
      address: reward
    }
  ]

  const response = await multicall(DerifyRewardsAbi, calls)

  if (!isEmpty(response)) {
    const [getPositionReward, getBondInfo, getExchangeBondSizeUpperBound, bankBondPool] = response

    const [bankBalance] = bankBondPool
    const { maxBondSize } = getExchangeBondSizeUpperBound
    const { bondAnnualInterestRatio, bondBalance, bondReturnBalance, bondWalletBalance } = getBondInfo
    const { drfAccumulatedBalance, drfBalance, marginTokenAccumulatedBalance, marginTokenBalance } = getPositionReward

    output = {
      drfBalance: formatUnits(String(drfBalance), 8),
      bankBalance: formatUnits(String(bankBalance), 8),
      bondBalance: formatUnits(String(bondBalance), 8),
      exchangeable: formatUnits(String(maxBondSize), 8),
      bondReturnBalance: formatUnits(String(bondReturnBalance), 8),
      bondWalletBalance: formatUnits(String(bondWalletBalance), 8),
      marginTokenBalance: formatUnits(String(marginTokenBalance), 8),
      drfAccumulatedBalance: formatUnits(String(drfAccumulatedBalance), 8),
      bondAnnualInterestRatio: formatUnits(String(bondAnnualInterestRatio), 8),
      marginTokenAccumulatedBalance: formatUnits(String(marginTokenAccumulatedBalance), 8)
    }

    // console.info(output)
    return output
  }

  return output
}

export const getTraderStakingDAT = async (trader: string): Promise<Record<string, any>> => {
  let output = {}
  const calls = [
    {
      name: 'getStakingInfo',
      address: contracts.derifyProtocol.contractAddress,
      params: [trader]
    }
  ]

  const response = await multicall(DerifyProtocolAbi, calls)

  if (!isEmpty(response)) {
    const [{ drfBalance, edrfBalance }] = response
    console.info('edrfBalance:', safeInterceptionValues(edrfBalance, 8))
    output = {
      drfBalance: safeInterceptionValues(drfBalance, 8),
      edrfBalance: safeInterceptionValues(edrfBalance, 8)
    }

    // console.info(output)
    return output
  }

  return output
}

export const getStakingDrfPoolDAT = async () => {
  const c = getDerifyProtocolContract()
  const d = await c.stakingDrfPool()
  // const d1 = await c.getAllBrokers()
  // console.info(d1)
  /**
   [
   "0x34D2F68529CCE3080A2eF473BC35Fa95FFaB4589",
   "0x8d1c40E9deeD46A4E9b624668aB409c5071aB40f",
   "0x02d33286fe1d09e12443f9B9336e5Bc8Ce836f9F",
   "0x8BF5722AF17ce9F25211F4Cb8DFF5639831A2250",
   "0x8edF30f73ae345453d93961944B7154e6C820ce1",
   "0xd8034FBEb2C952c32a3486162c2f2Fe4F577F2C3",
   "0xaEd7Fe9824C7cCAabaE8399913A14616f8CfD2D8",
   "0x3Da157db622e6f0C49B913994ddFf64cf9Cc4D58",
   "0xE28144BdfA86fc9eb561B94a1e527eB3da82473F",
   "0x1cBF309cf31C94156E9C1ED7Da889a633B87B480",
   "0x556e85AE6746582ac7FbA2BB83C71d271c08ce29",
   "0x1DEeB58F9c6c473FeB7D3f933e19e3168E9133E3",
   "0x777a581705E636A04346232Bac2f7278490Bd84b",
   "0xb9e9Cf59AA13f6Cf1DB1F0dd1Bd934E83Ad66FE7",
   "0xF275cb110d7eaDfF04113DDC215e3E062237619b",
   "0x78fBEDB25c5C6cE79C8e285401A18D5ada98338E",
   "0x27C156eC1040DE0DF425092003Afe7A04dfaA89c",
   "0xF0C09218232c4ED2b0285d210F428A0c338Cac6b",
   "0x11F33111a8336966820BAfCc147C7E8E40378233",
   "0xADAA19580D5eC95b80E84575040e9B8483da67fE",
   "0x43146F4045E9D435A6939c353949D3390c4645A6",
   "0x134C1A243E69cb8D971bD83C715AF454B591F5C5",
   "0x85bB069B3a6aD2af22A55d866ac0a5Ea2EbC9dBD",
   "0xEA3747F18f643123cC765C6CA1D3fcd79A258f0B",
   "0x78d3E487ae016c2C628CcB033c1C912C1e5582ab",
   "0x33D3A5172DE62117De027F8Eb73d7Aeb7ED728c3",
   "0x558dA052f27eA5Fcf15B17D6A0c2B0D227E0ED49",
   "0x80d951f4EaCB18B33000FE97aF02C023AC8058A3",
   "0x5cACae1b51d643CD1bc976cCa9B5E05837a6Bb35",
   "0x59D40a35944e962149c57f0e4E7b4C2fA41C0A1e",
   "0x64cc07A4c945311453F1Db1948A526fc0A46aA5C",
   "0x05f829EF7000006513d72835C7a49e66E4FbF95A",
   "0x326f046186d3CBeE166E235a827cd6709BE1c626",
   "0xdb8124a606144EFa7Cd3bbBf7C65B134d30e1792",
   "0xc30C1462981C7b90E8C1F854dc8c9db567d1D06B",
   "0xEf7d85e2Ae4b4479f4afCfb86e25022e4568D656",
   "0x4e5eE53b0d5395b6817f13BbEa73Ebd30b7ddF82",
   "0xADe8Ea94E3A87242304fDc8f835063cA007E125B",
   "0x0E17f190d49A97969FB724232D24DAF070c321A9",
   "0xff60B56695edBF5b1055d962343466c8fB6a154d",
   "0x7d1937417c07C5982335A0f0210319399cc60148",
   "0x80621a3809F64D6620875706d61cbcfDa57C677c",
   "0x3Fa7493f627aCb70AF6eb983E557927B542682D6",
   "0x077fCfd4112b0990866a1926f625b397aC75Ed98",
   "0x44c0909048dbd5504a5395cbAF286fee51A30162",
   "0x5fd16C50c628cd5c9913288155b9cCd4ba422c89",
   "0x7CeaC256d5569b52E57367d631916aCC67d834d7",
   "0x3f59b415d75237553b491a0A8EB3aa2905E81E8a",
   "0x2aA9055cB8725666D659E8756F6c142a8dAe8838",
   "0xfAf8Dc28F4172fEC4B4615B9C6A731026Ec1D8Db",
   "0x25CC275CFE3Cce1700E816e00d4CD1f60872038A",
   "0x464ea139e593bcfCC965005d8d3A961fC0918B7a",
   "0xE23E3D6C749141156B98753aD71074906D38c97b",
   "0x3B8F7A1922B52DD5746E127Fc83d35889CE52256",
   "0x940Fb480F0736245e12ed919ED82Af70cFB90F20",
   "0xC8852cAF0bDAD2586085FEFDD6cFd3113b24636E",
   "0x6d5D66bB3d8d6361f2aEE3d6143becEea23bD286",
   "0xcB08d9bD265F1a00b3f828C1d3Fb8e81f081dbb6",
   "0xA6d850A78718c88660beB3ac5F409A55F325E684",
   "0xCA234F8585D05654b5001c50eBD12FFD2663e556",
   "0xbE187147D2BE529Ee4f5F3948716a085eEA8D539",
   "0xfAaf5D88609fd5Ef171671da0189019e7d4D4943",
   "0xAc85e6c4DC1969C5573e69Fa83baF49F01348F53",
   "0xBad58e5CAE3b4767D16a37F701aFC8F880334fd6",
   "0x4ED9eEC7A88091ABC248EF40B46837260a3b0647",
   "0x88eCacBC333dd501b8AAFEBA672Ae5A8622b997F",
   "0xa9AB7f15772bb3FdC59666243Ab89d1b73a77017",
   "0x3ca37D82B6154C0D6761c7af8ef708Dd85eD1F3e",
   "0x99dCa03F94734E2C3e34C7EeaaDd4168147e5a5e",
   "0xE69D4CB4824749d4ec59DF037E27B524EEC37161",
   "0xE0A7B4FDbba069A50DD5682D757d581e5bA8a458",
   "0xD15b6C3ffD4B931DbD6cb90cD220509df2179E6b",
   "0xafAB0F4b0c538FbF327539D515608dcF35896448",
   "0x908751841B60a6DB590183D2ee31e2Dd0aD18156",
   "0xEf878c183932b942F84202ae2C3E76A0f7E45bf7",
   "0xA2dcA1c655c330f0Df8edeAFd127f80d76AE75aF",
   "0x3357B57645D08701219fA5924762399C66F682bF"
   ]
   */
  return safeInterceptionValues(String(d), 8)
}

export const getBankBDRFPoolDAT = async (reward: string) => {
  const c = getDerifyRewardsContract(reward)
  const d = await c.bankBondPool()
  return safeInterceptionValues(String(d), 8)
}

export const getBrokerInfo = async (trader: string) => {
  const base = {
    isBroker: false,
    usdRewardBalance: '0',
    drfRewardBalance: '0',
    accumulatedDrfReward: '0',
    accumulatedUsdReward: '0'
  }
  const c = getDerifyBrokerContract()

  try {
    const res = await c.getBrokerInfo(trader)

    const { usdRewardBalance, drfRewardBalance, accumulatedDrfReward, accumulatedUsdReward, validPeriodInBlocks } = res
    // console.info({
    //   isBroker: true,
    //   usdRewardBalance: safeInterceptionValues(usdRewardBalance),
    //   drfRewardBalance: safeInterceptionValues(drfRewardBalance),
    //   validPeriodInBlocks: Number(validPeriodInBlocks),
    //   accumulatedDrfReward: safeInterceptionValues(accumulatedDrfReward),
    //   accumulatedUsdReward: safeInterceptionValues(accumulatedUsdReward)
    // })
    return {
      isBroker: true,
      usdRewardBalance: safeInterceptionValues(usdRewardBalance),
      drfRewardBalance: safeInterceptionValues(drfRewardBalance),
      validPeriodInBlocks: Number(validPeriodInBlocks),
      accumulatedDrfReward: safeInterceptionValues(accumulatedDrfReward),
      accumulatedUsdReward: safeInterceptionValues(accumulatedUsdReward)
    }
  } catch (e) {
    // DBroker: GBI_NOT_BROKER
    console.info(e)
    return base
  }
}

export const initialPCFAndSpotPrice = (): MarginTokenWithQuote => {
  let value = Object.create(null)
  let quote = Object.create(null)

  QUOTE_TOKENS.forEach((t) => {
    quote = {
      ...quote,
      [t.symbol]: '0'
    }
  })
  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: quote
    }
  })

  return value
}

export const getPCFAndSpotPrice = async (p: MarginTokenWithQuote) => {
  const calls1: any[] = []
  const calls2: any[] = []
  const output1 = initialPCFAndSpotPrice()
  const output2 = initialPCFAndSpotPrice()

  for (const k in p) {
    for (const j in p[k as MarginTokenKeys]) {
      calls1.push({
        name: 'getPositionChangeFeeRatio',
        address: p[k as MarginTokenKeys][j as QuoteTokenKeys],
        quoteToken: j,
        marginToken: k
      })
      calls2.push({
        name: 'getSpotPrice',
        address: p[k as MarginTokenKeys][j as QuoteTokenKeys],
        quoteToken: j,
        marginToken: k
      })
    }
  }

  const calls = [...calls1, ...calls2]

  const response = await multicall(DerifyDerivativeAbi, calls)

  if (!isEmpty(response)) {
    const _chunk = chunk(response, calls1.length) as any[]
    _chunk[0].forEach((ratio: BigNumberish, index: number) => {
      const _ratio = Number(safeInterceptionValues(String(ratio), 4)) * 100
      const { marginToken, quoteToken } = calls1[index]
      output1[marginToken as MarginTokenKeys] = { ...output1[marginToken as MarginTokenKeys], [quoteToken]: _ratio }
    })
    _chunk[1].forEach((spotPrice: BigNumberish, index: number) => {
      const { marginToken, quoteToken } = calls2[index]
      output2[marginToken as MarginTokenKeys] = {
        ...output2[marginToken as MarginTokenKeys],
        [quoteToken]: safeInterceptionValues(String(spotPrice), 8)
      }
    })

    return { data1: output1, data2: output2 }
  }

  return { data1: output1, data2: output2 }
}
