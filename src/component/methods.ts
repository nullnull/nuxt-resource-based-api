import Vue from 'vue'
import Vuex from 'vuex'
import { Resource, IndexMethod, ShowMethod, ShowMethodForSingular, NewMethod, CreateMethod, EditMethod, UpdateMethod, DestroyMethod } from "../index"
import { createActionName } from "../util"

interface Generator {
  index: (resource: string, callbacks: any) => { [x: string]: IndexMethod }
  show: (resource: string, callbacks: any) => { [x: string]: ShowMethod | ShowMethodForSingular }
  new: (resource: string, callbacks: any) => { [x: string]: NewMethod } & { [x: string]: CreateMethod }
  create: (resource: string, callbacks: any) => { [x: string]: CreateMethod }
  edit: (resource: string, callbacks: any) => { [x: string]: EditMethod } & { [x: string]: UpdateMethod }
  update: (resource: string, callbacks: any) => { [x: string]: UpdateMethod }
  destroy: (resource: string, callbacks: any) => { [x: string]: DestroyMethod }
}

const generator: Generator = {
  index(resource: string, { createHeaders, errorHandler }) {
    const actionName: string = createActionName(resource, 'index')
    const method = async function (force = false) {
      try {
        await this.$store.dispatch(`${resource}/${actionName}`, {
          headers: createHeaders(this),
          force: force
        })
      } catch(e) {
        errorHandler(e, this)
      }
    }
    return { [actionName]: method }
  },
  show(resource: string, { createHeaders, errorHandler }) {
    const actionName: string = createActionName(resource, 'show')
    const method = async function (id: number, force = false) {
      try {
        await this.$store.dispatch(`${resource}/${actionName}`, {
          headers: createHeaders(this),
          id: id,
          force: force
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }
    return { [actionName]: method }
  },
  new(resource: string, { createHeaders, errorHandler }) {
    const actionName: string = createActionName(resource, 'new')
    const method = async function (force = false) {
      try {
        await this.$store.dispatch(`${resource}/${actionName}`, {
          headers: createHeaders(this),
          force: force
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }
    const createMethod = this.create(resource, { createHeaders, errorHandler })
    return { [actionName]: method, ...createMethod }
  },
  create(resource: string, { createHeaders, errorHandler }) {
    const actionName: string = createActionName(resource, 'create')
    const method = async function (record = undefined) {
      try {
        return await this.$store.dispatch(`${resource}/${actionName}`, {
          headers: createHeaders(this),
          record
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }
    return { [actionName]: method }
  },
  edit(resource: string, { createHeaders, errorHandler }) {
    const actionName: string = createActionName(resource, 'edit')
    const method = async function (id: number, force = false) {
      try {
        await this.$store.dispatch(`${resource}/${actionName}`, {
          headers: createHeaders(this),
          id: id,
          force: force
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }
    const updateMethod = this.update(resource, { createHeaders, errorHandler })
    return { [actionName]: method, ...updateMethod }
  },
  update(resource: string, { createHeaders, errorHandler }) {
    const actionName: string = createActionName(resource, 'update')
    const method = async function (record = undefined) {
      try {
        return await this.$store.dispatch(`${resource}/${actionName}`, {
          headers: createHeaders(this),
          record
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }
    return { [actionName]: method }
  },
  destroy(resource: string, { createHeaders, errorHandler }) {
    const actionName: string = createActionName(resource, 'destroy')
    const method = async function (id: number) {
      try {
        await this.$store.dispatch(`${resource}/${actionName}`, {
          headers: createHeaders(this),
          id: id,
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }
    return { [actionName]: method }
  },
}

const generateMethods = (
  resources: Resource[],
  {
    createHeaders = (app: Vue): object => { return {} },
    errorHandler = (e: any, app: Vue): void => { throw e }
  } = {}
): { [x: string]: IndexMethod | ShowMethod | ShowMethodForSingular | NewMethod | CreateMethod | EditMethod | UpdateMethod | DestroyMethod } => {
  return resources.map(resource => {
    if (!generator[resource.action]) {
      return null
    }
    return generator[resource.action](resource.resource, { createHeaders, errorHandler })
  }).filter(x => x).reduce((acc, x) => Object.assign(x, acc), {})
}
export default generateMethods