node version: v16.14.0\
npm version: v8.3.1\
sass version: ^1.52.1


const marginToken = useMarginToken((state) => state.marginToken)
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