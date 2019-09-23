import { Resource, IndexMethod, ShowMethod, ShowMethodForSingular, NewMethod, CreateMethod, EditMethod, UpdateMethod, DestroyMethod } from "../index"
import { Methods, MethodCallback } from "../index"
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
    const method = async function (force = false) {
      try {
        await this.$store.dispatch(`${resource}/index`, {
          headers: createHeaders(this),
          force: force
        })
      } catch(e) {
        errorHandler(e, this)
      }
    }
    return { [methodName]: method }
  },
  show(resource: string, { createHeaders, errorHandler }) {
    const methodName: string = snake_toCamel(`fetch_${resource}`)
    const method = async function (id: number, force = false) {
      try {
        await this.$store.dispatch(`${resource}/show`, {
          headers: createHeaders(this),
          id: id,
          force: force
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }
    return { [methodName]: method }
  },
  new(resource: string, { createHeaders, errorHandler }) {
    // new
    const methodNameNew: string = snake_toCamel(`fetch_initializing_${resource}`)
    const methodNew = async function (force = false) {
      try {
        await this.$store.dispatch(`${resource}/new`, {
          headers: createHeaders(this),
          force: force
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }
    // create
    const methodNameCreate: string = snake_toCamel(`create_${resource}`)
    const methodCreate = async function (force = false) {
      try {
        return await this.$store.dispatch(`${resource}/create`, {
          headers: createHeaders(this),
        })
      } catch (e) {
        errorHandler(e, this)
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
    const methodEdit = async function (id: number, force = false) {
      try {
        await this.$store.dispatch(`${resource}/edit`, {
          headers: createHeaders(this),
          id: id,
          force: force
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }
    // update
    const methodNameUpdate: string = snake_toCamel(`update_${resource}`)
    const methodUpdate = async function (id: number, force = false) {
      try {
        return await this.$store.dispatch(`${resource}/update`, {
          headers: createHeaders(this),
          id: id,
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }
    return {
      [methodNameEdit]: methodEdit,
      [methodNameUpdate]: methodUpdate
    }
  },
  destroy(resource: string, { createHeaders, errorHandler }) {
    const methodName: string = snake_toCamel(`destroy_${resource}`)
    const method = async function (id: number) {
      try {
        await this.$store.dispatch(`${resource}/destroy`, {
          headers: createHeaders(this),
          id: id,
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }
    return { [methodName]: method }
  },
}

const generateMethods = (resources: Resource[], { createHeaders, errorHandler }: MethodCallback): Methods => {
  return resources.map(resource => {
    if (!generator[resource.action]) {
      return null
    }
    return generator[resource.action](resource.resource, { createHeaders, errorHandler })
  }).filter(x => x).reduce((acc, x) => Object.assign(x, acc), {})
}
export default generateMethods