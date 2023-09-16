import classNames from 'classnames'

interface Props {
  text?: string
  fixed?: boolean
  mini?: boolean
  small?: boolean
  absolute?: boolean
}

function Spinner({ text, fixed, mini, small, absolute }: Props) {
  return text ? (
    <small className="web-text-spinner">{text} ...</small>
  ) : (
    <div className={classNames('web-spinner', { fixed: fixed, mini: mini, small: small, absolute: absolute })}>
      <div className="spinner" />
    </div>
  )
}

export default Spinner
