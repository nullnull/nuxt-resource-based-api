import { Resource, FetchCallback, Fetch } from "../index";

type Context = any // TODO

async function fetchResource(
  resource: string,
  method: string,
  context: Context,
  createHeaders?: Function,
  errorHandler?: Function,
) {
  const { store, route, query } = context
  const id = route.params.id || query.id
  const headers = createHeaders ? createHeaders(context) : {}

  try {
    if (['show', 'edit'].includes(method) && id !== undefined) {
      await store.dispatch(`${resource}/${method}`, {
        headers,
        id
      })
    } else if (['index', 'new', 'show', 'edit'].includes(method)) {
      await store.dispatch(`${resource}/${method}`, {
        headers,
      })
    }
  } catch (e) {
    errorHandler(e, context)
  }
}

const generateFetch = (resources: Resource[], { createHeaders, errorHandler }: FetchCallback): Fetch => {
  return async (context: Context) => {
    for (var i = 0; i < resources.length; i++) {
      const r = resources[i]
      await fetchResource(r.resource, r.action, context, createHeaders, errorHandler)
    }
  }
}

export default generateFetch