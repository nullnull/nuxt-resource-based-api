import { Resource, IndexMethod, ShowMethod, ShowMethodForSingular, NewMethod, CreateMethod, EditMethod, UpdateMethod, DestroyMethod } from "../index"
import { Methods, MethodCallback } from "../index"
import Vue from 'vue'
import Vuex from 'vuex'
import { snake_toCamel } from "../util"
import pluralize from 'pluralize'

interface Generator {
  index: (resource: string, callbacks: any) => { [x: string]: IndexMethod }
  show: (resource: string, callbacks: any) => { [x: string]: ShowMethod | ShowMethodForSingular }
  new: (resource: string, callbacks: any) => { [x: string]: NewMethod } & { [x: string]: CreateMethod }
  edit: (resource: string, callbacks: any) => { [x: string]: EditMethod } & { [x: string]: UpdateMethod }
  destroy: (resource: string, callbacks: any) => { [x: string]: DestroyMethod }
}

const generator: Generator = {
  index(resource: string, { createHeaders, errorHandler }) {
    const methodName: string = snake_toCamel(`fetch_${pluralize(resource)}`)
    const method = async (app: Vue, force = false) => {
      try {
        await app.$store.dispatch(`${resource}/index`, {
          headers: createHeaders(app),
          force: force
        })
      } catch(e) {
        errorHandler(e, app)
      }
    }
    return { [methodName]: method }
  },
  show(resource: string, { createHeaders, errorHandler }) {
    const methodName: string = snake_toCamel(`fetch_${resource}`)
    const method = async (app: Vue, id: number, force = false) => {
      try {
        await app.$store.dispatch(`${resource}/show`, {
          headers: createHeaders(app),
          id: id,
          force: force
        })
      } catch (e) {
        errorHandler(e, app)
      }
    }
    return { [methodName]: method }
  },
  new(resource: string, { createHeaders, errorHandler }) {
    // new
    const methodNameNew: string = snake_toCamel(`fetch_initializing_${resource}`)
    const methodNew = async (app: Vue, force = false) => {
      try {
        await app.$store.dispatch(`${resource}/new`, {
          headers: createHeaders(app),
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
          headers: createHeaders(app),
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
  edit(resource: string, { createHeaders, errorHandler }) {
    // edit
    const methodNameEdit: string = snake_toCamel(`fetch_editing_${resource}`)
    const methodEdit = async (app: Vue, id: number, force = false) => {
      try {
        await app.$store.dispatch(`${resource}/edit`, {
          headers: createHeaders(app),
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
          headers: createHeaders(app),
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
  destroy(resource: string, { createHeaders, errorHandler }) {
    const methodName: string = snake_toCamel(`destroy_${resource}`)
    const method = async (app: Vue, id: number) => {
      try {
        await app.$store.dispatch(`${resource}/destroy`, {
          headers: createHeaders(app),
          id: id,
        })
      } catch (e) {
        errorHandler(e, app)
      }
    }
    return { [methodName]: method }
  },
}

export default function generateMethods(resources: Resource[], { createHeaders, errorHandler }: MethodCallback): Methods {
  return resources.map(resource => {
    if (!generator[resource.action]) {
      return null
    }
    return generator[resource.action](resource.resource, { createHeaders, errorHandler })
  }).filter(x => x).reduce((acc, x) => Object.assign(x, acc), {})
}
