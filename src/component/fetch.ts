import { Resource } from "../index";
import { createActionName, last, snake_toCamel } from '../util'
import defaultQueryHandler from '../default/queryHandler'
type Context = any // TODO

async function fetchResource(
  resourceWithNamespace: string,
  action: string,
  context: Context,
  createHeaders: Function,
  errorHandler: Function,
  queryHandler: typeof defaultQueryHandler
) {
  const { store } = context
  const headers = createHeaders ? createHeaders(context) : {}

  try {
    if (['index', 'new', 'show', 'edit'].includes(action)) {
      await store.dispatch(`${resourceWithNamespace}/${createActionName(resourceWithNamespace, action)}`, {
        headers,
        query: queryHandler(resourceWithNamespace, action, context)
      })
    }
  } catch (e) {
    errorHandler(e, context)
  }
}

const generateFetch = (
  resources: Resource[],
  {
    createHeaders = (ctx: Context): object => { return {} },
    errorHandler = (e: any, ctx: Context): void => { throw e },
    queryHandler = defaultQueryHandler
  } = {}
): (ctx: Context) => void => {
  return async (context: Context) => {
    for (var i = 0; i < resources.length; i++) {
      const r = resources[i]
      await fetchResource(r.resource, r.action, context, createHeaders, errorHandler, queryHandler)
    }
  }
}

export default generateFetch