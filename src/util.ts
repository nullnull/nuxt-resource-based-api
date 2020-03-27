import pluralize from 'pluralize'

export const last = (xs) => { return xs[xs.length - 1] }

export function snake_toCamel(str: string) {
  return str.replace(/_[a-z]/g, match => match.slice(1).toUpperCase())
}

export function camelTo_snake(str: string) {
  return str.replace(/[A-Z]/g, match => '_' + match.toLowerCase())
}

export function showingResourceName(resourceWithNameSpace) {
  const resource = last(resourceWithNameSpace.split('/'))
  return resource
}

export function listingResourceName(resourceWithNameSpace) {
  const resource = last(resourceWithNameSpace.split('/'))
  return pluralize(resource)
}

export function editingResourceName(resourceWithNameSpace) {
  const resource = last(resourceWithNameSpace.split('/'))
  return snake_toCamel(`editing_${resource}`)
}

export function initializingResourceName(resourceWithNameSpace) {
  const resource = last(resourceWithNameSpace.split('/'))
  return snake_toCamel(`initializing_${resource}`)
}

export function createActionName(resourceWithNameSpace, action) {
  const resource = last(resourceWithNameSpace.split('/'))

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