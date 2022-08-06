const KLineConfig = (theme: string) => {
  const lineColor = theme === 'Dark' ? '#444' : '#e7e7e7'
  return {
    grid: {
      horizontal: {
        color: lineColor
      },
      vertical: {
        show: false
      }
    },
    candle: {
      tooltip: {
        // 'always' | 'follow_cross' | 'none'
        showRule: 'always',
        // 'standard' | 'rect'
        showType: 'standard',
        labels: ['T: ', 'O: ', 'C: ', 'H: ', 'L: ']
      }
    },
    xAxis: {
      axisLine: {
        color: lineColor
      },
      tickText: {
        color: '#888',
        size: 10
      },
      tickLine: {
        color: lineColor
      }
    },
    yAxis: {
      axisLine: {
        color: lineColor
      },
      tickText: {
        color: '#888',
        size: 10
      },
      tickLine: {
        color: lineColor
      }
    }
  }
}

export default KLineConfig
