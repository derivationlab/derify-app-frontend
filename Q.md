接入tv问题：
当k线数据条数不够`countBack`的值时，会一直触发`historyProvider.getBars`查询数据；
当前的接口参数不太符合tv接入标；