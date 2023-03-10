export default {
  section: 'Broker',
  dicts: {
    History: {
      Type: '类型',
      Type0: '收入',
      Type1: '取回',
      Type2: 'Gas',
      Type3: '赎回',
      Type4: '存入',
      Type5: '利息',
      History: '历史',
      Transaction: '交易记录',
      Trader: '交易者',
      Amount: '数量',
      Balance: '余额',
      Time: '时间',
      Income: '收入',
      Gas: 'Gas',
      Withdraw: '取回'
    },
    Transaction: {
      Open: '开仓',
      Close: '平仓',
      Type: '类型',
      Type0: '市价委托',
      Type1: '限价委托',
      Type2: '止盈',
      Type3: '止损',
      Type4: '自动减仓',
      Type5: '强制平仓',
      Transaction: '交易记录',
      MarketPrice: '市价委托',
      LimitPrice: '限价委托',
      TakeProfit: '止盈',
      StopLoss: '止损',
      Deleverage: '自动减仓',
      Liquidate: '强制平仓',
      RealizedPnL: '已实现盈亏',
      Time: '时间'
    },
    Trader: {
      Trader: '交易者',
      LastTransaction: '最近交易',
      LastTransactionTime: '最近交易时间',
      LastTransactionTimeM: '最近交易时间',
      RegistrationTime: '注册时间',
      Time: '时间'
    },
    TV: {
      Registered: '你已经注册',
      days: '天',
      made: '你已经产生',
      transactions: '交易次数',
      Join: '加入我们成为经纪商！'
    },
    Reg: {
      Title: '燃烧eDRF获得经纪商权限',
      TitleTip: '经纪商可以获得推广用户的30%手续费返佣及一定的代币奖励。',
      Getting: '获得经纪商权限将花费你',
      Account: '账户',
      WalletBalance: '钱包余额',
      Insufficient: 'eDRF余额不足',
      Cancel: '取消',
      Failed: '执行失败',
      RegisterForBroker: '注册成为经纪商',
      EditBrokerInfo: '编辑经纪商信息',
      BrokerCode: '经纪商编码',
      Occupied: '您的编码已被占用，请重新设置',
      RuleTip1: '填入字母、数字或“_”',
      CodeTip: '这是你的经纪商编码，可以分享给你的交易用户',
      Name: '名称',
      RuleTip2: '填入字母、数字或“_”',
      Logo: 'Logo',
      UploadImage: '点击上传图片',
      LogoSize: 'Logo的尺寸为400*400像素且小于2M',
      UploadImageTip: '图片不能超过2M，请重新上传',
      Address: '地址',
      Language: '语言',
      Community: '社区',
      Introduction: '介绍',
      Less: '小于500个字符',
      Confirm: '确认',
      ReCheck: '信息填写不完整，请重新填写',
      Congratulation: '恭喜！!',
      CongratulationTip: '您的经纪商权限已经开通！',
      CheckItOut: '去看看'
    },
    BV: {
      BrokerAccountBalance: '经纪商账户余额',
      EarnedTip:
        '从 <strong>{{time}}</strong> 开始你共计赚了 <strong>{{Amount}}</strong> {{ Margin }}和<strong>{{DRF}}</strong> DRF',
      ClaimAll: '全部提现',
      DailyRewards: '日收益',
      TotalRewards: '全网总收益占比 <em>{{data}}</em>',
      DailyActiveTrader: '日活用户',
      Transactions: '<em>{{data}}</em> 笔交易',
      BrokerRank: '经纪商排名',
      RankList: '排名列表',
      BrokerPrivilegeExpiration: '经纪商权限有效期',
      BrokerPrivilegeExpirationTip:
        '权限有效期到期后将无法获得经纪商奖励，但仍会保持经纪商身份，您可以随时燃烧eDRF恢复经纪商奖励权益',
      Extend: '续期',
      days: '天',
      Expired: '已过期',
      Renew: '恢复',
      ExpireAt: '到期日',
      MyPromotionLink: '我的推广链接'
    },
    RankList: {
      BrokerRank: '经纪商排名',
      Name: '名称',
      TotalRewards: '总收益',
      TotalTraders: '总用户数',
      DailyRewards: '日收益',
      Rank: '排名'
    },
    Extend: {
      ExtendBrokerPrivilege: '延长经纪商权限',
      WalletBalance: '钱包余额',
      BrokerPrivilegePricePerDay: '每日经纪商权限价格',
      AmountToBurn: '燃烧数量',
      days: '天',
      BurneDRF: '燃烧 eDRF'
    }
  }
}
