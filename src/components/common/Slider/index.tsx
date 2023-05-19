import classNames from 'classnames'
import { last, head, round } from 'lodash'

import React, { FC } from 'react'
import ReactSlider from 'react-slider'

interface Props {
  value: number
  marks?: number[]
  suffix?: string
  onChange: (val: number) => void
}

const _ReactSlider = ReactSlider as any

const Slider: FC<Props> = ({ value, marks = [0, 25, 50, 75, 100], suffix = '%', onChange }) => {
  const onSliderClick = (e: any) => {
    if (e.target.className === 'c-slider-marks') {
      const { width, x } = e.target.getBoundingClientRect()
      const index = round(((e.pageX - x) / width) * (marks.length - 1))
      onChange(marks[index])
    }
  }

  return (
    <div className="c-slider-layout" onClick={onSliderClick}>
      <_ReactSlider
        max={last(marks)}
        min={head(marks)}
        value={value}
        onChange={onChange}
        className="c-slider"
        thumbClassName="c-slider-thumb"
        trackClassName="c-slider-track"
      />

      <div className="c-slider-marks">
        {marks.map((item, index) => (
          <span
            key={index}
            className={classNames({
              active: value >= item,
              current: value >= item
            })}
            onClick={() => onChange(item)}
          >
            <em>
              {item}
              {suffix}
            </em>
          </span>
        ))}
      </div>
    </div>
  )
}

export default Slider
