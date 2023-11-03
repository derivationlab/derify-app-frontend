export default {
  section: 'Trade',
  dictionary: {
    Derivative: {
      NoTrading: '无交易对'
    },
    kline: {
      SearchTip: '搜索衍生品',
      NetPositionRate: '净头寸率',
      NetPositionRateTip: '净头寸=多仓持仓量-空仓持仓量。净头寸比例=净头寸/总头寸*100%',
      PCFRate: '动仓费率',
      PCFRateTip:
        '系统对扩大裸头寸的仓位变动（开仓/平仓）行为进行惩罚，对减少裸头寸的仓位变动行为进行奖励。该值为正，则代表开多/平空需要支付动仓费，开空/平多可以获得动仓费；该值为负，则代表开空/平多需要支付动仓费，开多/平空可以获得动仓费。',
      PositionMiningAPY: '持仓挖矿收益率',
      PositionMiningAPYTip: '仓位杠杆越高，持仓挖矿的收益率越高。',
      NoKLineData: '没有K线交易数据'
    },
    MyPosition: {
      MyPosition: '我的持仓',
      UnrealizedPnL: '未实现盈亏',
      UnrealizedPnLTip:
        '多仓未实现盈亏 = (当前价格 - 开仓均价) * 持仓量 \n 空仓未实现盈亏 = (开仓均价 - 当前价格) * 持仓量',
      Volume: '数量',
      VolumeTip: '持有此合约的数量',
      AvgPrice: '开仓均价',
      AvgPriceTip: '此仓位的开仓平均价格',
      LiqPrice: '强平价格',
      LiqPriceTip: '此价格为预估的强平价格。如果该合约的价格低于该价格(多仓)或高于该价格(空仓)，您可能会被强制平仓。',
      Margin: '保证金',
      MarginTip: '仓位占用的保证金=持仓额/杠杆',
      MarginRate: '保证金率',
      MarginRateTip: '保证金比例越小，风险越大。当保证金率小于维持保证金率{{Ratio}}%时开始触发强制减仓。',
      TakeProfit: '止盈',
      TakeProfitTip: '当价格达到止盈设置的价格时，将自动平仓，此时仓位属于盈利状态，平仓防止盈利回撤。',
      StopLoss: '止损',
      StopLossTip: '当价格达到止损设置的价格时，将自动平仓，此时仓位属于亏损状态，平仓防止继续亏损。',
      Edit: '编辑',
      Close: '平仓',
      CloseAll: '一键平仓'
    },
    MyOrder: {
      MyOrder: '我的委托',
      Type: '类型',
      Open: '开仓',
      Close: '平仓',
      LimitPrice: '限价委托',
      TakeProfit: '止盈',
      StopLoss: '止损',
      Volume: '数量',
      VolumeTip: '此委托将交易的合约的数量',
      Price: '价格',
      Time: '时间',
      Cancel: '取消',
      CancelAll: '取消所有委托',
      CancelOrder: '取消委托',
      CancelOrderTip: '确定立即取消该委托单？',
      Confirm: '确认',
      CancelAllOrders: '取消所有委托',
      CancelAllOrdersTip: '确定立即取消所有委托？'
    },
    TradeHistory: {
      TradeHistory: '成交记录',
      Type: '类型',
      Open: '开仓',
      Close: '平仓',
      MarketPrice: '市价委托',
      LimitPrice: '限价委托',
      TakeProfit: '止盈',
      StopLoss: '止损',
      Deleverage: '自动减仓',
      Liquidate: '强制平仓',
      RealizedPnL: '已实现盈亏',
      RealizedPnLTip:
        '多仓已实现盈亏 = (平仓价格 - 开仓均价) * 平仓量 \n 空仓已实现盈亏 = (开仓均价 - 平仓价格) * 平仓量',
      TradingFee: '手续费',
      TradingFeeTip: '手续费=交易额*手续费率',
      PositionChangeFee: '动仓费',
      PositionChangeFeeTip:
        '开仓动仓费=-（|开仓后该交易对裸头寸额|-|开仓前该交易对裸头寸额|）*[（|开仓前动仓费率|+|开仓后动仓费率|）/2+ρ] \n 平仓动仓费：（|平仓后该交易对裸头寸额|-|平仓前该交易对裸头寸额|）*[（|平仓前动仓费率|+|平仓后动仓费率|）/2+ρ]',
      VolumeBase: '成交量',
      VolumeBaseTip: '开/平仓时成交的仓位数量',
      VolumeQuoted: '成交额',
      VolumeQuotedTip: '开/平仓成交金额 = 成交价格 * 成交数量',
      Price: '价格',
      Time: '时间'
    },
    Bench: {
      ListMyToken: '上架代币',
      Margin: '保证金',
      MarginBalance: '保证金余额',
      MarginBalanceTip: '保证金余额=账户余额+总未实现盈亏，是用户账户的账面资产额',
      AvaliableMarginBalance: '可用保证金',
      AvaliableMarginBalanceTip:
        '可用保证金=保证金余额-总持仓占用保证金-总限价委托单占用保证金，代表可以提现或开仓的金额',
      Deposit: '存入',
      Withdraw: '取回',
      PriceType: '委托类型',
      Market: '市价委托',
      Limit: '限价委托',
      MarketPrice: '市价委托',
      LimitPrice: '限价委托',
      Leverage: '杠杆',
      Confirm: '确认',
      Price: '价格',
      Volume: '数量',
      Max: 'Max',
      NumberError: '数值有误，请重新输入',
      Long: '开多',
      Short: '开空',
      TowWay: '双向对冲',
      SearchTip: '搜索名称或合约地址',
      NoResultsFound: '无搜索结果',
      TheMinimumPositionValue: '最小开仓净值为 {{USD}} USD({{Margin}} {{Token}})',
      TheMaximumPositionValue: '最大开仓净值为 {{Amount}}'
    },
    COP: {
      OpenPosition: '开仓',
      Long: '开多',
      Short: '开空',
      MarketPrice: '市价委托',
      Volume: '数量',
      PCFEstimate: '动仓费（预估）',
      PCFEstimateTip:
        '开仓动仓费 = -（|开仓后该交易对裸头寸额|-|开仓前该交易对裸头寸额|）* [（|开仓前动仓费率|+|开仓后动仓费率|）/2+ρ] ',
      TradingFee: '手续费',
      TradingFeeTip: '手续费=交易额*手续费率',
      Confirm: '确认',
      LiquiditylimitTip: '当前流动性处于限仓状态，您最多可以开仓 {{data}}'
    },
    TPSL: {
      Title: '止盈/止损',
      PositionAveragePrice: '开仓均价',
      TakeProfit: '止盈',
      TakeProfitTip1: '当市场价格到达',
      TakeProfitTip2: '时，将触发止盈委托并平仓。预估盈利额为',
      StopLoss: '止损',
      StopLossTip1: '当市场价格到达',
      StopLossTip2: '时，将触发止损委托并平仓。预估盈利额为',
      Tip: '多仓止盈价不得小于开仓均价，止损价不得大于开仓均价；\n 空仓止盈价不得大于开仓均价，止损价不得小于开仓均价；'
    },
    ClosePosition: {
      ClosePosition: '平仓',
      PositionAveragePrice: '开仓均价',
      PositionCloseable: '可平仓量',
      AmountToClose: '平仓量',
      Volume: '数量',
      PCFEstimate: '动仓费（预估）',
      PCFEstimateTip:
        '平仓动仓费：（|平仓后该交易对裸头寸额|-|平仓前该交易对裸头寸额|）*[（|平仓前动仓费率|+|平仓后动仓费率|）/2+ρ] ',
      TradingFee: '手续费',
      TradingFeeTip: '手续费=交易额*手续费率',
      CloseAllPositions: '一键平仓',
      CloseAllPositionsTip: '确定按市价平掉所有仓位？',
      Confirm: '确认'
    },
    Deposit: {
      DepositFromWallet: '从钱包存入',
      WalletBalance: '钱包余额',
      AmountToDeposit: '存入数量',
      Max: 'Max',
      Confirm: '确认'
    },
    Withdraw: {
      WithdrawToWallet: '取回至钱包',
      Withdrawable: '可取回额',
      MarginUsage: '占用保证金',
      AmountToWithdraw: '取回数量',
      Confirm: '确认',
      WithdrawTip:
        '根据系统风控规则，你将收到 <b>{{MarginAmount}} {{ MarginTokenList }}</b> 和 <b>{{bMarginAmount}} {{bMarginToken}}</b>作为补偿，你可以在回购池余额>0时以1:1的比例将{{bMarginToken}}换回{{MarginTokenList}}'
    }
  }
}
