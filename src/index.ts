import Vue from 'vue'
import generateInitialState from './store/state'
import generateMutations from './store/mutation'
import generateActionsWithAuth from './store/action'
import defaultRequestCallback from './default/requestCallback'
import generateComputed from './component/computed'
import generateMethods from './component/methods'
import generateFetch from './component/fetch'

export type IndexMethod = (force?: boolean) => Promise<void>
export type ShowMethod = (id: number, force?: boolean) => Promise<void>
export type ShowMethodForSingular = (force?: boolean) => Promise<void>
export type NewMethod = () => Promise<void>
export type CreateMethod = (record?: object) => Promise<any>
export type EditMethod = (id: number, force?: boolean) => Promise<void>
export type UpdateMethod = (record?: object) => Promise<any>
export type DestroyMethod = (id: number) => Promise<void>

export type Action = 'index' | 'show' | 'new' | 'create' | 'edit' | 'update' | 'destroy'

export interface ActionExtension {
  [k: string]: (ctx: Context, payload: any) => void | Promise<void>
}

export interface MutationExtension {
  [k: string]: (state: State, payload: any) => void
}

export interface StateExtension {
  [k: string]: any
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

// TODO
type Context = any // TODO

const Napi = {
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
  generateComputed,
  generateMethods,
  generateFetch
}

export default Napi

