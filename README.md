node version: v16.14.0\
npm version: v8.3.1\
sass version: ^1.52.1


const marginToken = useMarginToken((state) => state.marginToken)
const brokerBound = useBrokerInfo((state) => state.brokerBound)
const [state, dispatch] = useReducer(reducer, stateInit)


todo:
. 现货价格更新频率带来的数据更新不及时问题；
. 质押授权修改-全额还是限额；
. usePairIndicator 指标数据被 api/app_data 参数限制了，影响了k线币对选择的下拉数据；
. broker里的资金单位显示数据显示
. 路由链接带上保证金名字
. bbusd的完整信息 bMarginToken；
. 保证金参数变为url-id;
. brokers_rank_list 支持 marginToken;
. 检测如果路由id不是marginToken，则跳转；
. getBrokerInfo 分mt；
. broker_reward_transactions 分mt；
. 由于加了mt参数，需要全局检查路由跳转；
. Close Position 数据问题；
. api/trade_records分mt；
. /Users/wugongwei/1-project/derify-app-frontend/src/reducers/brokerBind.ts
. BN数据解析方法简化；
. /Users/wugongwei/1-project/derify-app-frontend/src/pages/web/Broker/Workbench/c/Data/Transaction.tsx