import React, { FC, useMemo } from 'react'
import classNames from 'classnames'
interface Props {
  pageSize?: number
  total: number
  page: number
  full?: boolean
  onChange: (page: number) => void
}

const calcPager = (page: number, pages: number): number[] => {
  const res = [page]
  for (let i = 1; i <= 4; i++) {
    if (page - i >= 0) {
      res.unshift(page - i)
    }
    if (page + i <= pages - 1) {
      res.push(page + i)
    }
  }
  return res
}

const Pagination: FC<Props> = ({ pageSize = 10, total, page, full, onChange }) => {
  const totalPage = useMemo(() => ~~(total / pageSize) + 1, [total, pageSize])
  const currPage = useMemo(() => page + 1, [page])

  const pager: number[] = useMemo(() => calcPager(page, totalPage), [page, totalPage])

  const isInHome = useMemo(() => page === 0, [page])
  const isInEnd = useMemo(() => page === totalPage - 1, [page, totalPage])

  const goHome = () => {
    if (!isInHome) onChange(0)
  }
  const goPrev = () => {
    if (!isInHome && page > 0) onChange(page - 1)
  }
  const goNext = () => {
    if (!isInEnd && page < totalPage - 1) onChange(page + 1)
  }
  const goEnd = () => {
    if (!isInEnd) onChange(totalPage - 1)
  }

  return (
    <div className="web-pagination">
      <span className={classNames('web-pagination-home', { disabled: isInHome })} onClick={goHome} />
      <span className={classNames('web-pagination-prev', { disabled: isInHome })} onClick={goPrev} />
      {full ? (
        <>
          {pager.map((item: number, index: number) => (
            <i key={index} className={classNames({ active: item === page })} onClick={() => onChange(item)}>
              {item + 1}
            </i>
          ))}
        </>
      ) : (
        <em>
          {currPage} of {totalPage}
        </em>
      )}

      <span className={classNames('web-pagination-next', { disabled: isInEnd })} onClick={goNext} />
      <span className={classNames('web-pagination-end', { disabled: isInEnd })} onClick={goEnd} />
    </div>
  )
}

export default Pagination
