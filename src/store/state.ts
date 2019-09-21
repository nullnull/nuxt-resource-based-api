import pluralize from 'pluralize'

import { editingResourceName, initializingResourceName } from '../util'
import { Action, StateExtension, State } from '../../types'

export default function generateInitialState(
  resource: string,
  actions: Action[],
  extension: StateExtension = {}
): State {
  let state = {}
  state["shouldRefreshIndexState"] = true
  state["shouldRefreshShowState"] = true
  if (actions.includes('show') || actions.includes('edit')) {
    state[resource] = null
  }
  if (actions.includes('index')) {
    state[pluralize(resource)] = []
  }
  if (actions.includes('edit')) {
    state[editingResourceName(resource)] = null
  }
  if (actions.includes('new')) {
    state[initializingResourceName(resource)] = null
  }

  const initialState = {
    ...state,
    ...extension
  }

  return initialState
}
