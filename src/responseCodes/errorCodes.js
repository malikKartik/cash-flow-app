exports.errorCodes = {
  SU_EMAIL_EXISTS: {
    code: 'AUTH301',
    message: 'Email or username exists!',
    status: 403,
    toast: true,
  },
  SU_INCORRECT_OTP: {
    code: 'AUTH302',
    message: 'Incorrect OTP!',
    status: 403,
    toast: true,
  },
  LI_FAILURE: {
    code: 'AUTH303',
    message: 'Incorrect username or password',
    status: 404,
    toast: true,
  },
  INTERNAL_SERVER_ERROR: {
    code: 'SERV301',
    message: 'Internal server error',
    status: 500,
    toast: true,
  },
  NOT_AUTHORIZED: {
    code: 'AUTH304',
    message: 'Not authorized!',
    status: 401,
    toast: true,
  },
};
