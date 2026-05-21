export const successResponse = (res, { message = 'Success', data = null, statusCode = 200 } = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export const errorResponse = (res, { message = 'Something went wrong', statusCode = 500, errors = null } = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  })
}

export const paginatedResponse = (res, { message = 'Success', data, pagination }) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  })
}