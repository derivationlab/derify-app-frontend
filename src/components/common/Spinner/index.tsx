import classNames from 'classnames'

interface Props {
  fixed?: boolean
  absolute?: boolean
}

function Spinner({ fixed, absolute }: Props) {
  return (
    <div className={classNames('web-spinner', { fixed: fixed, absolute: absolute })}>
      <div className="spinner" />
    </div>
  )
}

export default Spinner
