import { editingResourceName, initializingResourceName, listingResourceName, showingResourceName } from '../util'
import { Action, StateExtension, State } from '../index'

export default function generateInitialState(
  resourceWithNamespace: string,
  actions: Action[],
  extension: StateExtension = {}
): State {
  let state: any = {}
  if (actions.includes('show') || actions.includes('edit')) {
    state[showingResourceName(resourceWithNamespace)] = null
    state.shouldRefreshShowState = true
  }
  if (actions.includes('index')) {
    state[listingResourceName(resourceWithNamespace)] = []
    state.lastQueryForIndex = null
    state.shouldRefreshIndexState = true
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
