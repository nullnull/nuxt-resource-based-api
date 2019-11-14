import { editingResourceName, initializingResourceName, listingResourceName, showingResourceName } from '../util'
import { Action, StateExtension, State } from '../index'

export default function generateInitialState(
  resourceWithNamespace: string,
  actions: Action[],
  extension: StateExtension = {}
): State {
  let state = {}
  state["shouldRefreshIndexState"] = true
  state["shouldRefreshShowState"] = true
  if (actions.includes('show') || actions.includes('edit')) {
    state[showingResourceName(resourceWithNamespace)] = null
  }
  if (actions.includes('index')) {
    state[listingResourceName(resourceWithNamespace)] = []
  }
  if (actions.includes('edit')) {
    state[editingResourceName(resourceWithNamespace)] = null
  }
  if (actions.includes('new')) {
    state[initializingResourceName(resourceWithNamespace)] = null
  }

  const initialState = {
    ...state,
    ...extension
  }

  return initialState
}
