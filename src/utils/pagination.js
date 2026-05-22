// src/utils/pagination.js

/**
 * Extracts pagination params from query string and returns
 * everything needed to paginate any Mongoose query.
 *
 * Usage:
 * const { page, limit, skip } = getPagination(req.query)
 * const courses = await Course.find().skip(skip).limit(limit)
 *
 * WHY a utility?
 * Every listing endpoint needs pagination.
 * Centralizing it means one place to change defaults.
 */
export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

/**
 * Builds the pagination metadata object sent in every paginated response.
 */
export const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit)

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}