export default {
  section: 'Nav',
  dictionary: {
    Nav: {
      Trade: '交易',
      Earn: '收益',
      Dashboard: '仪表盘',
      Broker: '经纪商',
      Faucet: '水龙头',
      AddToken: 'Add Token',
      ConnectWallet: '连接钱包',
      Data: '数据',
      Overview: '总览',
      BuybackPlan: '回购计划',
      GrantList: '奖励计划'
    },
    CW: {
      Title: '选择钱包',
      TitleTip: '连接钱包前请确认已经阅读、理解和接受Derivation Labs的',
      TermsOfService: '服务协议',
      SelectNetwork: '选择网络'
    },
    AddToken: {
      Add: '将 {{token}} 添加到钱包',
      Buy: '去 pancakeswap 买 {{token}}',
      Sell: '去 pancakeswap 卖 {{token}}'
    },
    Tool: {
      Language: '语言',
      Theme: '主题',
      Light: '明亮',
      Dark: '黑暗',
      Feedback: '客服',
      Tutorial: '教程',
      Docs: '文档',
      Test: '测试网',
      Whitepaper: '白皮书',
      Community: '社区',
      SystemParameters: '系统参数',
      Token: '通证'
    },
    Account: {
      Account: '账户',
      MarginBalance: '保证金余额',
      MarginBalanceTip: '保证金余额=账户余额+总未实现盈亏，是用户账户的账面资产额',
      AvaliableMarginBalance: '可用保证金',
      AvaliableMarginBalanceTip:
        '可用保证金=保证金余额-总持仓占用保证金-总限价委托单占用保证金，代表可以提现或开仓的金额',
      Deposit: '存入',
      Withdraw: '取回',
      Disconnect: '断开连接'
    },
    BindBroker: {
      Title1: '使用产品前你需要绑定一个经纪商，请输入经纪商编码',
      Title2: '可以从你的经纪商处获取经纪商编码',
      Confirm: '确认',
      NoCode: '我没有编码...',
      ErrorCode: '您输入的编码不存在或无效',
      BrokerConfirm: '经纪商信息确认',
      SelectBroker: '选择经纪商',
      InputCode: '填写经纪商编码',
      Language: '语言',
      Community: '社区',
      SetBroker: '设置为我的经纪商'
    },
    MySpace: {
      MySpace: '我的空间',
      Margin: '保证金',
      MarginBalanceRate: '保证金余额/率',
      PositionVolume: '持仓量',
      PositionMiningRewards: '持仓挖矿收益',
      BrokerRewards: '经纪商收益',
      DetailInfo: '详细信息'
    },
    SystemParameters: {
      SystemParameters: '系统参数',
      SystemRelevant: '系统相关',
      Parameters: '参数',
      Value: '参数值',
      OpenClosePositionLimit: '开仓/平仓上限公式参数θ',
      BuybackFundRatio: '回购基金比例参数x',
      MinPositionValue: '最小开仓净值',
      MMRMaintenanceMarginRatio: '维持保证金率',
      LMRLiquidationMarginRatio: '自动强平保证金率',
      MultiplierofMMRAfterADL: '自动减仓后的维持保证金率倍数n',
      iAPRofbToken: 'bToken质押收益率 i',
      eDRFMintperblock: 'eDRF单个区块产量',
      BrokerPrivilegeFeeeDRF: '经纪商资格费用（eDRF数）',
      eDRFforbrokerprivilegeperblock: '经纪商单个区块续期eDRF数',
      MultiplierofGasFee: 'Gas Fee倍数',
      Buybackcycleblocks: '回购周期区块数',
      BuybackSlippageTolerance: '回购滑点容忍值',
      MinGrantDRFspositionmining: '最小奖励DRF数（持仓挖矿）',
      MinGrantDRFsbroker: '最小奖励DRF数（经纪商）',
      MinGrantDRFstradingcompetition: '最小奖励DRF数（交易比赛）',
      TradingToken: '交易币种',
      Token: '币种',
      kPCFRate: '动仓费率公式参数κ',
      yPCFRate: '动仓费率公式参数ψ',
      PCF: '动仓费公式参数ρ',
      TradingFeeRatio: '手续费率',
      Maxlimitorders: '限价委托单数量上限',
      Maxleverage: '最大杠杆数'
    }
  }
}
