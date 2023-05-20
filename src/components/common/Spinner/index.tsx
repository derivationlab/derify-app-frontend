import classNames from 'classnames'

interface Props {
  fixed?: boolean
  small?: boolean
  absolute?: boolean
}

function Spinner({ fixed, small, absolute }: Props) {
  return (
    <div className={classNames('web-spinner', { fixed: fixed, small: small, absolute: absolute })}>
      <div className="spinner" />
    </div>
  )
}

export default Spinner
