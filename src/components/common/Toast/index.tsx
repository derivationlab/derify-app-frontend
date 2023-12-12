import React, { FC } from 'react'
import toast, { Toaster } from 'react-hot-toast'

window.toast = toast

const Toast: FC = () => {
  const option = {
    success: {
      className: 'web-toast-success'
    },
    loading: {
      className: 'web-toast-loading'
    },
    error: {
      className: 'web-toast-error'
    }
  }
  return <Toaster toastOptions={option} />
}

export default Toast
