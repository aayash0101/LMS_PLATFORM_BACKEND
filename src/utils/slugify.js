export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')    
    .replace(/[\s_-]+/g, '-')    
    .replace(/^-+|-+$/g, '')     
}

export const generateUniqueSlug = (text) => {
  const base = slugify(text)
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${base}-${suffix}`
}