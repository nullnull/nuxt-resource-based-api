import { Context } from "vm";
import { Resource } from "../index";
import VueRouter from "vue-router";
import { Store } from "vuex/types/index";

async function setResource(
  router: VueRouter,
  store: Store<any>,
  resource: string,
  method: string,
  { id: id }
) {
  try {
    if (['show', 'edit'].includes(method) && id !== undefined) {
      await store.dispatch(`${resource}/${method}`, {
        headers: {
          Authorization: store.state.session.token,
        },
        id: id
      })
    } else if (['index', 'new', 'show', 'edit'].includes(method)) {
      await store.dispatch(`${resource}/${method}`, {
        headers: {
          Authorization: store.state.session.token,
        },
      })
    }
  } catch (e) {
    if (e === 401 || (e.response && e.response.status === 401)) {
      store.dispatch('session/logout', {}, { root: true })
      router.push('/session/login')
    } else if (e === 404 || (e.response && e.response.status === 404)) {
      if (process.env.NODE_ENV !== 'development') {
        router.push('/404')
      }
    } else {
      throw e
    }
  }
}

export default function generateFetch(resources: Resource[]) {
  return async (context: Context) => {
    const { app, query, store } = context

    for (var i = 0; i < resources.length; i++) {
      const r = resources[i]
      await setResource(app.router, store, r.resource, r.action, {
        id: query.id
      })
    }
  }
}
