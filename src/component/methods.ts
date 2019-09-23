import { Resource, IndexMethod, ShowMethod, ShowMethodForSingular, NewMethod, CreateMethod, EditMethod, UpdateMethod, DestroyMethod } from "../index"
import { Methods, MethodCallback } from "../index"
import Vuex from 'vuex'
import { createActionName } from "../util"

interface Generator {
  index: (resource: string, callbacks: any) => { [x: string]: IndexMethod }
  show: (resource: string, callbacks: any) => { [x: string]: ShowMethod | ShowMethodForSingular }
  new: (resource: string, callbacks: any) => { [x: string]: NewMethod } & { [x: string]: CreateMethod }
  edit: (resource: string, callbacks: any) => { [x: string]: EditMethod } & { [x: string]: UpdateMethod }
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
    // new
    const actionNameNew: string = createActionName(resource, 'new')
    const methodNew = async function (force = false) {
      try {
        await this.$store.dispatch(`${resource}/${actionNameNew}`, {
          headers: createHeaders(this),
          force: force
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }
    // create
    const actionNameCreate: string = createActionName(resource, 'create')
    const methodCreate = async function (force = false) {
      try {
        return await this.$store.dispatch(`${resource}/${actionNameCreate}`, {
          headers: createHeaders(this),
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }

    return {
      [actionNameNew]: methodNew,
      [actionNameCreate]: methodCreate
    }
  },
  edit(resource: string, { createHeaders, errorHandler }) {
    // edit
    const actionNameEdit: string = createActionName(resource, 'edit')
    const methodEdit = async function (id: number, force = false) {
      try {
        await this.$store.dispatch(`${resource}/${actionNameEdit}`, {
          headers: createHeaders(this),
          id: id,
          force: force
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }
    // update
    const actionNameUpdate: string = createActionName(resource, 'update')
    const methodUpdate = async function (id: number, force = false) {
      try {
        return await this.$store.dispatch(`${resource}/${actionNameUpdate}`, {
          headers: createHeaders(this),
          id: id,
        })
      } catch (e) {
        errorHandler(e, this)
      }
    }
    return {
      [actionNameEdit]: methodEdit,
      [actionNameUpdate]: methodUpdate
    }
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

const generateMethods = (resources: Resource[], { createHeaders, errorHandler }: MethodCallback): Methods => {
  return resources.map(resource => {
    if (!generator[resource.action]) {
      return null
    }
    return generator[resource.action](resource.resource, { createHeaders, errorHandler })
  }).filter(x => x).reduce((acc, x) => Object.assign(x, acc), {})
}
export default generateMethods