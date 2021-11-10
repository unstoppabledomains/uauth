import createError from './createError'

export const PopupTimeoutError = createError(
  'PopupTimeoutError',
  'The popup has timed out.',
)

export const PopupClosedError = createError(
  'PopupClosedError',
  'The popup was closed.',
)
