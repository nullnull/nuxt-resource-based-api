import { Resource } from "../component"
import Vue from 'vue'
import { snake_toCamel } from "../util"
import pluralize from 'pluralize'

export type IndexMethod = (app: Vue, force?: boolean) => Promise<void>
export type ShowMethod = (app: Vue, id: number, force?: boolean) => Promise<void>
export type ShowMethodForSingular = (app: Vue, force?: boolean) => Promise<void>
export type NewMethod = (app: Vue) => Promise<void>
export type CreateMethod = (app: Vue) => Promise<any>
export type EditMethod = (app: Vue, id: number, force?: boolean) => Promise<void>
export type UpdateMethod = (app: Vue, id: number) => Promise<any>
export type DestroyMethod = (app: Vue, id: number) => Promise<void>

interface Generator {
  index: (resource: string) => { [x: string]: IndexMethod }
  show: (resource: string) => { [x: string]: ShowMethod | ShowMethodForSingular }
  new: (resource: string) => { [x: string]: NewMethod } & { [x: string]: CreateMethod }
  edit: (resource: string) => { [x: string]: EditMethod } & { [x: string]: UpdateMethod }
  destroy: (resource: string) => { [x: string]: DestroyMethod }
}

const errorHandler = (e: any, app: Vue) => {
  if (e === 401 || (e.response && e.response.status === 401)) {
    app.$util.notify(
      'Salesforceのセッション情報が古くなっています。一度ログアウトしてください。',
      'danger'
    )
  } else if (e === 404 || (e.response && e.response.status === 404)) {
    if (process.env.NODE_ENV !== 'development') {
      app.$router.push('/404')
    } else {
      throw e
    }
  } else if (e.response && e.response.status === 422) {
    app.$util.notify('不正な入力です', 'danger')
  } else if (e.response && e.response.status === 429) {
    app.$util.notify('チームの誰かが更新済みです(5分間に1回のみ更新できます)', 'danger')
  } else if (e.response && e.response.status === 500) {
    app.$util.notify('サーバーでエラーが発生しました', 'danger')
  } else {
    throw e
  }
}

const generator: Generator = {
  index(resource: string) {
    const methodName: string = snake_toCamel(`fetch_${pluralize(resource)}`)
    const method = async (app: Vue, force = false) => {
      try {
        await app.$store.dispatch(`${resource}/index`, {
          headers: {
            Authorization: app.$store.state.session.token,
          },
          force: force
        })
      } catch(e) {
        errorHandler(e, app)
      }
    }
    return { [methodName]: method }
  },
  show(resource: string) {
    const methodName: string = snake_toCamel(`fetch_${resource}`)
    const method = async (app: Vue, id: number, force = false) => {
      try {
        await app.$store.dispatch(`${resource}/show`, {
          headers: {
            Authorization: app.$store.state.session.token,
          },
          id: id,
          force: force
        })
      } catch (e) {
        errorHandler(e, app)
      }
    }
    return { [methodName]: method }
  },
  new(resource: string) {
    // new
    const methodNameNew: string = snake_toCamel(`fetch_initializing_${resource}`)
    const methodNew = async (app: Vue, force = false) => {
      try {
        await app.$store.dispatch(`${resource}/new`, {
          headers: {
            Authorization: app.$store.state.session.token,
          },
          force: force
        })
      } catch (e) {
        errorHandler(e, app)
      }
    }
    // create
    const methodNameCreate: string = snake_toCamel(`create_${resource}`)
    const methodCreate = async (app: Vue, force = false) => {
      try {
        return await app.$store.dispatch(`${resource}/create`, {
          headers: {
            Authorization: app.$store.state.session.token,
          },
        })
      } catch (e) {
        errorHandler(e, app)
      }
    }

    return {
      [methodNameNew]: methodNew,
      [methodNameCreate]: methodCreate
    }
  },
  edit(resource: string) {
    // edit
    const methodNameEdit: string = snake_toCamel(`fetch_editing_${resource}`)
    const methodEdit = async (app: Vue, id: number, force = false) => {
      try {
        await app.$store.dispatch(`${resource}/edit`, {
          headers: {
            Authorization: app.$store.state.session.token,
          },
          id: id,
          force: force
        })
      } catch (e) {
        errorHandler(e, app)
      }
    }
    // update
    const methodNameUpdate: string = snake_toCamel(`update_${resource}`)
    const methodUpdate = async (app: Vue, id: number, force = false) => {
      try {
        return await app.$store.dispatch(`${resource}/update`, {
          headers: {
            Authorization: app.$store.state.session.token,
          },
          id: id,
        })
      } catch (e) {
        errorHandler(e, app)
      }
    }
    return {
      [methodNameEdit]: methodEdit,
      [methodNameUpdate]: methodUpdate
    }
  },
  destroy(resource: string) {
    const methodName: string = snake_toCamel(`destroy_${resource}`)
    const method = async (app: Vue, id: number) => {
      try {
        await app.$store.dispatch(`${resource}/destroy`, {
          headers: {
            Authorization: app.$store.state.session.token,
          },
          id: id,
        })
      } catch (e) {
        errorHandler(e, app)
      }
    }
    return { [methodName]: method }
  },
}

export default function generateMethods(resources: Resource[]) {
  return resources.map(resource => {
    if (!generator[resource.action]) {
      return null
    }
    return generator[resource.action](resource.resource)
  }).filter(x => x).reduce((acc, x) => Object.assign(x, acc), {})
}
