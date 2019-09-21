export function snake_toCamel(str) {
  return str.replace(/_[a-z]/g, match => match.slice(1).toUpperCase())
}

export function camelTo_snake(str) {
  return str.replace(/[A-Z]/g, match => '_' + match.toLowerCase())
}

export function editingResourceName(resource) {
  return snake_toCamel(`editing_${resource}`)
}

export function initializingResourceName(resource) {
  return snake_toCamel(`initializing_${resource}`)
}

const objectMap = function (obj: object, f: (any) => any) {
  return Object.entries(obj).map(([k, v]) => f([k, v]))
}

export function generatePathWithQuery(resources: string, query: object | undefined) {
  if (query === undefined) {
    return camelTo_snake(resources)
  } else {
    return camelTo_snake(resources) + '?' + objectMap(query, ([k, v]) => `${k}=${v}`).join("&")
  }
}
