import createError from './createError'

// Uauth specific errors
// Error code E1000 will be assigned for generic or unspecified errors,
// TBD, public facing wiki/docs page with list of error codes,

export const PopupTimeoutError = createError(
  'PopupTimeoutError',
  'The popup has timed out.',
  'E1001',
)

export const PopupClosedError = createError(
  'PopupClosedError',
  'The popup was closed.',
  'E1002',
)
