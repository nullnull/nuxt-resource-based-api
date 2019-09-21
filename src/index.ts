import generateInitialState from './store/state'
import generateMutations from './store/mutation'
import generateActionsWithAuth from './store/action'
import defaultRequestCallback from './default/requestCallback'

export type Action = 'index' | 'show' | 'new' | 'create' | 'edit' | 'update' | 'destroy'

export interface ActionExtension {
  [k: string]: (ctx: any, payload: any) => void | Promise<void> // TODO ctxとpayloadの定義
}

export interface MutationExtension {
  [k: string]: (state: State, payload: any) => void
}

export interface StateExtension {
  [k: string]: any // TODO ctxとpayloadの定義
}

export interface State { // TODO 本来はresourceごとに定義すべき
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

export default {
  requestCallback: defaultRequestCallback,
  apiUrl: '',
  setConfig(config) {
    this.apiUrl = config.apiUrl || this.apiUrl
    this.requestCallback = config.requestCallback || this.requestCallback
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
