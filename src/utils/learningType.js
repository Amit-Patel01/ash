export const normalizeLearningType = (value) => {
  const rawValue =
    typeof value === 'object' && value !== null
      ? value.deliveryType || value.type || value.itemType || ''
      : value

  return String(rawValue || '').trim().toLowerCase() === 'webinar' ? 'webinar' : 'course'
}

export const getLearningTypeLabel = (value) =>
  normalizeLearningType(value) === 'webinar' ? 'Webinar' : 'Course'

export const getLearningTypePluralLabel = (value) =>
  normalizeLearningType(value) === 'webinar' ? 'Webinars' : 'Courses'
