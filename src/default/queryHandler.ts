import pluralize from 'pluralize'
import { last, snake_toCamel } from '../util'
type Context = any // TODO

export default (resourceWithNamespace: string, action: string, context: Context): Object => {
  const { route, query } = context
  const pathSplited = route.path.split('/')
  const queryAndParam = {
    ...query,
    ...route.params
  }
  const resource = last(resourceWithNamespace.split('/'))

  if (action === 'index') {
    const resourceFromPath = snake_toCamel(pathSplited[pathSplited.length - 1])
    if (resourceFromPath === pluralize(resource)) {
      return queryAndParam
    } else {
      return {}
    }
  } else {
    const resourceFromPath = snake_toCamel(pathSplited[pathSplited.length - 2])
    if (queryAndParam[`${resource}Id`]) {
      return {
        id: queryAndParam[`${resource}Id`]
      }
    } else if (queryAndParam.id && resourceFromPath === pluralize(resource)) {
      return {
        id: queryAndParam.id
      }
    } else {
      return {}
    }
  }
}