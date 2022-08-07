export interface FormInputProps {
  broker: string
  name: string
  logo: File | null | string
  id: string
  language: string
  telegram: string
  discord: string
  twitter: string
  reddit: string
  wechat: string
  introduction: string
}

export const defaultValues = {
  broker: '',
  name: '',
  logo: null,
  id: '',
  language: '',
  telegram: '',
  discord: '',
  twitter: '',
  reddit: '',
  wechat: '',
  introduction: ''
}

export interface CommunityProps {
  Telegram?: string
  Discord?: string
  Twitter?: string
  Reddit?: string
  WeChat?: string
}
// twitter: /^https?:\/\/([a-zA-Z]*)(.)?twitter.com\/(\w)+/,
//   instagram: /^https?:\/\/([a-zA-Z]*)(.)?instagram.com\/(\w)+/,
//   facebook: /^https?:\/\/([a-zA-Z]*)(.)?facebook.com\/(\w)+/,
//   discord: /^https?:\/\/([a-zA-Z]*)(.)?discord.com\/(\w)+/
export const patterns = {
  telegram: /^(https?:\/\/)?(www\.)?(telegram|t)\.me\/(u\/)?([\w-./?%&=]*)+\/?$/,
  discord: /^(https?:\/\/)?(www\.)?(discord)\.(com|gg)\/(u\/)?([\w-./?%&=]*)+\/?$/,
  twitter: /^(https?:\/\/)?(www\.)?(twitter)\.com\/(u\/)?([\w-./?%&=]*)+\/?$/,
  reddit: /^(https?:\/\/)?(www\.)?(reddit)\.com\/(u\/)?([\w-./?%&=]*)+\/?$/,
  wechat: /^[a-zA-Z]{1}[-_a-zA-Z0-9]{5,19}$/
}

export const rules2 = {
  account: {
    required: 'Required',
    pattern: {
      value: /^[\da-zA-Z_]+$/,
      message: 'Letters and numbers and "_" are accepted.'
    }
  },
  name: {
    required: 'Required',
    pattern: {
      value: /^[\da-zA-Z_ ]+$/,
      message: 'Letters, numbers, " " and "_" are accepted.'
    }
  },
  logo: {
    required: 'Required'
  },
  address: {
    required: 'Required',
    pattern: {
      value: /^(0x)?[\da-fA-F]{40}$/,
      message: 'Error address'
    }
  },
  telegram: {
    pattern: {
      value: patterns.telegram,
      message: 'Error telegram url'
    }
  },
  discord: {
    pattern: {
      value: patterns.discord,
      message: 'Error discord url'
    }
  },
  twitter: {
    pattern: {
      value: patterns.twitter,
      message: 'Error twitter url'
    }
  },
  reddit: {
    pattern: {
      value: patterns.reddit,
      message: 'Error reddit url'
    }
  },
  wechat: {},
  introduction: {
    required: 'Required',
    maxLength: {
      value: 500,
      message: 'Less than 500 characters.'
    }
  }
}

// export interface FormInputProps {
//   broker: string
//   name: string
//   logo: FileList | null | string
//   id: string
//   introduction: string
// }
//
// export const defaultValues = {
//   broker: '',
//   name: '',
//   logo: null,
//   id: '',
//   introduction: ''
// }

export const rules = {
  broker: {
    required: 'Information is incomplete, please re-check',
    pattern: {
      value: /^0x[a-fA-F0-9]{40}$/
    }
  },
  name: {
    required: 'Information is incomplete, please re-check'
    // pattern: {
    //   value: /^[\da-z_ ]+$/,
    //   message: 'Letters, numbers, " " and "_" are accepted.'
    // }
  },
  // logo: {
  //   required: 'Required'
  // },
  id: {
    required: 'Information is incomplete, please re-check',
    pattern: {
      value: /^[0-9a-zA-Z_@$]+$/,
      message: "Only support letters, numbers and symbols '_ ',' @ ',' $'"
    }
  },
  introduction: {
    required: 'Information is incomplete, please re-check',
    maxLength: {
      value: 500,
      message: 'Less than 500 characters.'
    }
  }
}
