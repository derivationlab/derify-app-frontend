import { Avatar } from '@arco-design/web-react'

import React from 'react'

interface Props {
  data: string[]
}

export const MultipleToken = ({ data }: Props) => {
  return (
    <Avatar.Group>
      {data.map((d) => (
        <Avatar key={d}>
          <img src={d} alt="" />
        </Avatar>
      ))}
    </Avatar.Group>
  )
}
