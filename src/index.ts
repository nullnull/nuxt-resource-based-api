import generateInitialState from './store/state'
import generateMutations from './store/mutation'
import generateActionsWithAuth from './store/action'
import defaultRequestCallback from './default/requestCallback'

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

const Vapi = {
  requestCallback(action, resource, query, headers, options, obj = {}): Promise<any> { throw 'requestCallback or apiUrl must be defined' },
  apiUrl: '',
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
  }
}

export default Vapi