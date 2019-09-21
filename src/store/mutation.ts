import pluralize from 'pluralize'
import changeCaseObject from 'change-case-object'

import { editingResourceName, initializingResourceName } from '../util'
import { Action, MutationExtension } from '../index'

export default function generateMutations(resource: string, actions: Action[], extension: MutationExtension = {}) {
  const indexMutation = {
    setIndexResponse(state, data) {
      state[pluralize(resource)] = changeCaseObject.camelCase(data)
      state.shouldRefreshIndexState = false
    },
    invalidateIndexState(state) {
      state.shouldRefreshIndexState = true
    },
    refreshRecordInIndexState(state, data) {
      data = changeCaseObject.camelCase(data)
      const index = state[pluralize(resource)].map(x => x.id).indexOf(data.id)
      const resources = state[pluralize(resource)].filter(x => x.id != data.id)
      if (index === -1) {
        resources.push(data)
      } else {
        resources.splice(index, 0, data)
      }
      state[pluralize(resource)] = resources
    }
  }

  const showMutations = {
    setShowResponse(state, data) {
      state[resource] = changeCaseObject.camelCase(data)
    },
    invalidateShowState(state) {
      state.shouldRefreshShowState = true
    }
  }

  const editMutations = {
    initializeEditingData(state, data) {
      state[editingResourceName(resource)] = changeCaseObject.camelCase(data)
    }
  }

  const newMutations = {
    initializeInitializingData(state, data) {
      state[initializingResourceName(resource)] = changeCaseObject.camelCase(
        data
      )
    }
  }

  const destroyMutations = {
    removeRcordInIndexState(state, id) {
      if (!state[pluralize(resource)]) {
        return
      }
      const resources = state[pluralize(resource)].filter(x => x.id != id)
      state[pluralize(resource)] = resources
    }
  }

  return {
    ...(actions.includes('index') ? indexMutation : {}),
    ...(actions.includes('show') ? showMutations : {}),
    ...(actions.includes('edit') ? editMutations : {}),
    ...(actions.includes('new') ? newMutations : {}),
    ...(actions.includes('destroy') ? destroyMutations : {}),
    ...extension
  }
}
