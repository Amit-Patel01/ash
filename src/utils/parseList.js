export const parseList = (val) => {
  if (!val) return []

  let current = val

  // 1. Try recursive JSON parsing (up to 5 levels deep)
  for (let i = 0; i < 5; i++) {
    if (typeof current === 'string') {
      const trimmed = current.trim()
      if (!trimmed) return []
      if (
        (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        trimmed.startsWith('{')
      ) {
        try {
          const parsed = JSON.parse(trimmed)
          current = parsed
        } catch {
          break
        }
      } else {
        break
      }
    } else {
      break
    }
  }

  // 2. If it's a string, split by comma
  if (typeof current === 'string') {
    current = current.split(',').map((s) => s.trim()).filter(Boolean)
  }

  // 3. Process array items recursively & clean escaped characters
  if (Array.isArray(current)) {
    const cleaned = []
    const processItem = (item) => {
      if (item == null) return
      if (Array.isArray(item)) {
        item.forEach(processItem)
        return
      }
      if (typeof item === 'string') {
        let str = item.trim()
        for (let i = 0; i < 3; i++) {
          if (
            (str.startsWith('[') && str.endsWith(']')) ||
            (str.startsWith('"') && str.endsWith('"'))
          ) {
            try {
              const subParsed = JSON.parse(str)
              if (Array.isArray(subParsed)) {
                subParsed.forEach(processItem)
                return
              } else if (typeof subParsed === 'string') {
                str = subParsed.trim()
              } else {
                break
              }
            } catch {
              break
            }
          } else {
            break
          }
        }
        // Clean stray quotes, brackets, and backslashes around the string value
        str = str.replace(/^[\\"'\[\s]+|[\\"'\]\s]+$/g, '').trim()
        if (str) {
          cleaned.push(str)
        }
      } else {
        cleaned.push(String(item))
      }
    }
    current.forEach(processItem)
    return cleaned
  }

  return []
}

export default parseList
