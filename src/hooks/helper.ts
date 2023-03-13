import BN from 'bignumber.js'
import { BigNumberish } from '@ethersproject/bignumber'
import { chunk, flatten, isEmpty } from 'lodash'

import multicall from '@/utils/multicall'
import contracts from '@/config/contracts'
import { OpeningType } from '@/zustand/useCalcOpeningDAT'
import { PositionSideTypes } from '@/typings'
import { findMarginToken, MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import {
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
import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import MarginTokenPriceFeedAbi from '@/config/abi/MarginTokenPriceFeed.json'

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
  console.info(p)
  const calls = Object.keys(p).map((key) => ({
    name: 'getMarginTokenPrice',
    address: p[key as MarginTokenKeys].priceFeed,
    marginToken: key as MarginTokenKeys
  }))
  console.info(calls)
  const response = await multicall(MarginTokenPriceFeedAbi, calls)
  console.info(response)
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
          [PositionSideTypes[calls[index].params[1] as number]]: safeInterceptionValues(String(limit), 8)
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
  positionSide: PositionSideTypes,
  openingType: OpeningType,
  tokenSelect: string,
  openingMaxLimit: string
) => {
  if (positionSide === PositionSideTypes.twoWay || openingType !== OpeningType.Market) return openingSize
  if (findMarginToken(tokenSelect)) {
    const mul = Number(spotPrice) * Number(openingMaxLimit)
    return isGT(openingSize, mul) ? mul : openingSize
  } else {
    return isGT(openingSize, openingMaxLimit) ? openingMaxLimit : openingSize
  }
}

export const calcChangeFee = async (
  side: PositionSideTypes,
  symbol: string,
  amount: string | number,
  spotPrice: string,
  exchange: string,
  derivative: string,
  isOpen = false
): Promise<string> => {
  let nakedPositionTradingPairAfterClosing_BN: BN = new BN(0)

  if (side === PositionSideTypes.twoWay) return '0'

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

  if (side === PositionSideTypes.long) {
    if (!isOpen) nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.minus(size).minus(shortTotalSize_BN)
    else nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.plus(size).minus(shortTotalSize_BN)
  }

  if (side === PositionSideTypes.short) {
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
  return safeInterceptionValues(String(d), 8)
}

export const getBankBDRFPoolDAT = async (reward: string) => {
  const c = getDerifyRewardsContract(reward)
  const d = await c.bankBondPool()
  return safeInterceptionValues(String(d), 8)
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
