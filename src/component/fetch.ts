import { Resource } from "../index";
import { createActionName } from '../util'
type Context = any // TODO

async function fetchResource(
  resource: string,
  action: string,
  context: Context,
  createHeaders?: Function,
  errorHandler?: Function,
) {
  const { store, route, query } = context
  const headers = createHeaders ? createHeaders(context) : {}

  try {
    if (['index', 'new', 'show', 'edit'].includes(action)) {
      await store.dispatch(`${resource}/${createActionName(resource, action)}`, {
        headers,
        query,
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
    errorHandler = (e: any, ctx: Context): void => { throw e }
  } = {}
): (ctx: Context) => void => {
  return async (context: Context) => {
    for (var i = 0; i < resources.length; i++) {
      const r = resources[i]
      await fetchResource(r.resource, r.action, context, createHeaders, errorHandler)
    }
  }
}

export default generateFetch