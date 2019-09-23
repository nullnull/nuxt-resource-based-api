import Vue from 'vue'
import generateInitialState from './store/state'
import generateMutations from './store/mutation'
import generateActionsWithAuth from './store/action'
import defaultRequestCallback from './default/requestCallback'
import generateComputed from './component/computed'
import generateMethods from './component/methods'
import generateFetch from './component/fetch'

// TODO
type Context = any
export interface FetchCallback {
  createHeaders: (context: Context) => object
  errorHandler: (e: any, context: Context) => void
}
export interface MethodCallback {
  createHeaders: (app: Vue) => object
  errorHandler: (e: any, app: Vue) => void
}

export type Fetch = (ctx: Context) => void
export interface Methods {
  [x: string]: (app: Vue, id?: number) => Promise<any>
}
export interface Computeds {
  [x: string]: () => any
}


export type IndexMethod = (app: Vue, force?: boolean) => Promise<void>
export type ShowMethod = (app: Vue, id: number, force?: boolean) => Promise<void>
export type ShowMethodForSingular = (app: Vue, force?: boolean) => Promise<void>
export type NewMethod = (app: Vue) => Promise<void>
export type CreateMethod = (app: Vue) => Promise<any>
export type EditMethod = (app: Vue, id: number, force?: boolean) => Promise<void>
export type UpdateMethod = (app: Vue, id: number) => Promise<any>
export type DestroyMethod = (app: Vue, id: number) => Promise<void>

export type Action = 'index' | 'show' | 'new' | 'create' | 'edit' | 'update' | 'destroy'

export interface ActionExtension {
  [k: string]: (ctx: any, payload: any) => void | Promise<void> // TODO: Define types for ctx, payload
}

export interface MutationExtension {
  [k: string]: (state: State, payload: any) => void
}

export interface StateExtension {
  [k: string]: any // TODO: Define types for ctx, payload
}

export interface State {
  [x: string]: any
}

interface Extention {
  state?: StateExtension
  mutations?: MutationExtension
  actions?: ActionExtension
}

export interface ActionConfig {
  useIndexActionInShowAction?: boolean
  useShowActionInEditAction?: boolean
  refreshPropertiesAlways?: boolean
  isSingular?: boolean
}

export interface Options {
  extention?: Extention,
  actionConfig?: ActionConfig
}

export interface Resource {
  resource: string
  action: Action
  options?: Options
}

const Vapi = {
  apiUrl: '',
  requestCallback(_action, _resource, _query, _headers, _options, _obj = {}): Promise<any> { throw 'requestCallback or apiUrl must be defined' },
  setConfig(config) {
    if (config.requestCallback) {
      this.requestCallback = config.requestCallback
    } else if (config.apiUrl) {
      this.apiUrl = config.apiUrl
      this.requestCallback = defaultRequestCallback(this.apiUrl)
    } else {
      throw 'requestCallback or apiUrl must be defined'
    }
  },
  createStore(
    resource: string,
    actions: Action[],
    options: Options = {},
  ) {
    const extention = options.extention || {}
    return {
      state: () => generateInitialState(resource, actions, extention.state),
      mutations: generateMutations(resource, actions, extention.mutations),
      actions: generateActionsWithAuth(
        resource,
        actions,
        this.requestCallback,
        extention.actions,
        options.actionConfig || {}
      )
    }
  },
  generateComputed: generateComputed as (r: Resource[]) => Computeds,
  generateMethods: generateMethods as (r: Resource[], { createHeaders, errorHandler }: MethodCallback) => Methods,
  generateFetch: generateFetch as (r: Resource[], { createHeaders, errorHandler }: FetchCallback) => Fetch,
}

export default Vapi

