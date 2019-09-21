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