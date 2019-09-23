import pluralize from 'pluralize'

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

export function createActionName(resource, action) {
  if (action === 'index') {
    return snake_toCamel(`fetch_${pluralize(resource)}`)
  } else if (action === 'show') {
    return snake_toCamel(`fetch_${resource}`)
  } else if (action === 'new') {
    return snake_toCamel(`initialize_${resource}`)
  } else if (action === 'create') {
    return snake_toCamel(`create_${resource}`)
  } else if (action === 'edit') {
    return snake_toCamel(`edit_${resource}`)
  } else if (action === 'update') {
    return snake_toCamel(`update_${resource}`)
  } else if (action === 'destroy') {
    return snake_toCamel(`destroy_${resource}`)
  }
}