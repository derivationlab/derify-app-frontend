import React, { FC } from 'react'
import classNames from 'classnames'
import RcTabs, { TabPane as RcTabPane, TabsProps, TabPaneProps } from 'rc-tabs'

export const Tabs: FC<TabsProps> = (props) => {
  return <RcTabs {...props} className={classNames('web-tabs', props.className)} />
}

export const TabPane: FC<TabPaneProps> = (props) => {
  return <RcTabPane {...props} className={classNames('web-tabs-pane', props.className)} />
}

export default Tabs
