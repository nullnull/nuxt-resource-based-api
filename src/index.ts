import generateInitialState from './store/state'
import generateMutations from './store/mutation'
import generateActionsWithAuth from './store/action'
import { Action, Options } from '../types'

export default function (
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
      extention.actions,
      options.actionConfig || {}
    )
  }
}
