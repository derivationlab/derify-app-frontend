export default {
  section: 'Trade',
  dicts: {
    kline: {
      SearchTip: 'Search derivatives ..',
      NetPositionRate: 'Net Position Rate',
      NetPositionRateTip:
        'Net Position=Long positon-Short postion.\n Net Position Rate=Net Position/Total position*100%',
      PCFRate: 'PCF Rate',
      PCFRateTip:
        'Transactions that increase system risk have to reward transactions that decrease system risk. Positive rate means PCF payment is required for opening long/closing short, and opening short/closing long gets the PCF reward, vice versa.',
      PositionMiningAPY: 'Position Mining APR.',
      PositionMiningAPYTip: 'The higher the leverage of positions, the higher the APR of position mining will be.'
    },
    MyPosition: {
      MyPosition: 'My Position',
      UnrealizedPnL: 'Unrealized PnL',
      UnrealizedPnLTip:
        'Unrealized P&L of Long Position = (Current Derivative Price – Average Position Price) * Position Held \n Unrealized P&L of Short Position = (Average Position Price - Current Derivative Price) * Position Held',
      Volume: 'Volume',
      VolumeTip: 'Position Held in this Derivative',
      AvgPrice: 'Avg. Price',
      AvgPriceTip: 'Average Opening Price for this Position',
      LiqPrice: 'Liq. Price',
      LiqPriceTip:
        'This price is the expected mandatory liquidation price. If the derivative price is lower than this price (long position) or higher than this price (short position), your position may be liquidated automatically. ',
      Margin: 'Margin',
      MarginTip: 'Used Position Margin = Position Held/Leverage',
      MarginRate: 'Margin Rate',
      MarginRateTip:
        'Risk increases as the margin rate decreases. When the margin rate is smaller than the maintenance margin 1%, the auto deleveraging will be triggered. ',
      TakeProfit: 'Take Profit',
      TakeProfitTip:
        'When the TP price is reached, system will be automatically close your position to realize your current profit.',
      StopLoss: 'Stop Loss',
      StopLossTip:
        'When the SL price is reached, system will be automatically close your position to prevent further loss.',
      Edit: 'Edit',
      Close: 'Close',
      CloseAll: 'CLOSE ALL'
    },
    MyOrder: {
      MyOrder: 'My Order',
      Type: 'Type',
      Open: 'Open',
      Close: 'Close',
      LimitPrice: 'Limit Price',
      TakeProfit: 'Take Profit',
      StopLoss: 'Stop Loss',
      Volume: 'Volume',
      VolumeTip: 'The volume of asset that this order will be trading.',
      Price: 'Price',
      Time: 'Time',
      Cancel: 'Cancel',
      CancelAll: 'CANCEL ALL',
      CancelOrder: 'Cancel Order',
      CancelOrderTip: 'Do you want to cancel this order IMMEDIATELY ?',
      Confirm: 'Confirm',
      CancelAllOrders: 'Cancel all orders',
      CancelAllOrdersTip: 'Do you want to cancel all orders IMMEDIATELY ?'
    },
    TradeHistory: {
      TradeHistory: 'Trade History',
      Type: 'Type',
      Open: 'Open',
      Close: 'Close',
      MarketPrice: 'Market Price',
      LimitPrice: 'Limit Price',
      TakeProfit: 'Take Profit',
      StopLoss: 'Stop Loss',
      Deleverage: 'Deleverage',
      Liquidate: 'Liquidate',
      RealizedPnL: 'Realized PnL',
      RealizedPnLTip:
        'Long position PnL = (Close Price - Open Price) * Amount \n Short position PnL = (Open Price - Close Price) * Amount',
      TradingFee: 'Trading Fee',
      TradingFeeTip: 'Trading Fee=Trading volume*Trading Fee Rate',
      PositionChangeFee: 'Position Change Fee',
      PositionChangeFeeTip:
        'PCF(Open position)=-(|Net position after open position|-|Net position before open position|)*[(|PCF rate after open positon|+|PCF rate before open position|)/2+ρ] \n PCF(Close position)=(|Net position after close position|-|Net position before close position|)*[(|PCF rate after close positon|+|PCF rate before close position|)/2+ρ]"',
      VolumeBase: 'Volume (Base)',
      VolumeBaseTip: 'The volume of asset that this order was opened/closed',
      VolumeQuoted: 'Volume (Quoted)',
      VolumeQuotedTip: 'Volume (Quoted) = Price * Volume (Base)',
      Price: 'Price',
      Time: 'Time'
    },
    Bench: {
      MarginBalance: 'Margin Balance',
      MarginBalanceTip:
        'The amount of money you actually have in your margin account.Margin balance = account balance + total unrealized PNL',
      AvaliableMarginBalance: 'Avaliable Margin Balance',
      AvaliableMarginBalanceTip:
        'Margin not frozen by open postions and thus available for withdrawal.. Available margin = margin balance - total position occupancy margin - total limit order occupancy margin',
      Deposit: 'Deposit',
      Withdraw: 'Withdraw',
      PriceType: 'Price Type',
      Market: 'Market',
      Limit: 'Limit',
      MarketPrice: 'Market Price',
      LimitPrice: 'Limit Price',
      Leverage: 'Leverage',
      Confirm: 'Confirm',
      Price: 'Price',
      Volume: 'Volume',
      Max: 'Max',
      NumberError: 'Number error, please retry...',
      MinNumber: 'The minimum number is {{limit}}U',
      Long: 'Long',
      Short: 'Short',
      TowWay: '2-Way'
    },
    COP: {
      OpenPosition: 'Open Position',
      Long: 'Long',
      Short: 'Short',
      MarketPrice: 'Market Price',
      Volume: 'Volume',
      PCFEstimate: 'PCF(Estimate)',
      PCFEstimateTip:
        'PCF(Open position)=-(|Net position after open position|-|Net position before open position|)*[(|PCF rate after open positon|+|PCF rate before open position|)/2+ρ]',
      TradingFee: 'Trading Fee',
      TradingFeeTip: 'Trading Fee=Trading volume*Trading Fee Rate',
      Confirm: 'Confirm',
      LiquiditylimitTip: 'Liquidity limit reached, maximum order is {{data}}'
    },
    TPSL: {
      Title: 'Take Profit / Stop Loss',
      PositionAveragePrice: 'Position Average Price',
      TakeProfit: 'Take Profit',
      TakeProfitTip1: 'When market price reaches',
      TakeProfitTip2: 'it will trigger Take Profit order to close this position. Estimated profit will be',
      StopLoss: 'Stop Loss',
      StopLossTip1: 'When market price reaches',
      StopLossTip2: 'it will trigger Stop Loss order to close this position. Estimated loss will be',
      Tip: 'Long positon:Take profit price should >= open price & Stop loss price should <= open price.\n Short position:Take profit price should <= open price & Stop loss price should >= open price.'
    },
    ClosePosition: {
      ClosePosition: 'Close Position',
      PositionAveragePrice: 'Position Average Price',
      PositionCloseable: 'Position Closeable',
      AmountToClose: 'Amount to close',
      Volume: 'Volume',
      PCFEstimate: 'PCF(Estimate)',
      PCFEstimateTip:
        'PCF(Close position)=(|Net position after close position|-|Net position before close position|)*[(|PCF rate after close positon|+|PCF rate before close position|)/2+ρ]',
      TradingFee: 'Trading Fee',
      TradingFeeTip: 'Trading Fee=Trading volume*Trading Fee Rate',
      CloseAllPositions: 'Close All Position',
      CloseAllPositionsTip: 'Do you want to close all positions at Market Price?',
      Confirm: 'Confirm'
    },
    Deposit: {
      DepositFromWallet: 'Deposit from wallet',
      WalletBalance: 'Wallet Balance',
      AmountToDeposit: 'Amount to deposit',
      Max: 'Max',
      Confirm: 'Confirm'
    },
    Withdraw: {
      WithdrawToWallet: 'Withdraw to wallet',
      Withdrawable: 'Withdrawable',
      MarginUsage: 'Margin Usage',
      AmountToWithdraw: 'Amount to withdraw',
      Confirm: 'Confirm',
      WithdrawTip:
        'Due to the system risk control rules, you will recieve <b>{{BUSD}} BUSD</b>, and <b>{{bBUSD}} bBUSD</b> as compensation. You can exchange bBUSD to BUSD at 1 : 1 ratio when Buyback Pool >0.'
    }
  }
}
