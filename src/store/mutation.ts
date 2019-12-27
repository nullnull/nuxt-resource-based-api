import pluralize from 'pluralize'
import changeCaseObject from 'change-case-object-chmurson'
import { snake_toCamel, editingResourceName, initializingResourceName, listingResourceName, showingResourceName } from '../util'
import { Action, MutationExtension } from '../index'

export default function generateMutations(resourceWithNamespace: string, actions: Action[], extension: MutationExtension = {}) {
  const indexMutation = {
    [snake_toCamel(`set_${listingResourceName(resourceWithNamespace)}`)](state, data, query) {
      state[listingResourceName(resourceWithNamespace)] = changeCaseObject.camelCase(data)
      state.lastQueryForIndex = query
      state.shouldRefreshIndexState = false
    },
    [snake_toCamel(`invalidate_${listingResourceName(resourceWithNamespace)}`)](state) {
      state.shouldRefreshIndexState = true
    },
    // If exists 'id' property in record, refresh record in index records
    [snake_toCamel(`refresh_record_in_${listingResourceName(resourceWithNamespace)}`)](state, data) {
      if (!data.id) {
        return
      }
      data = changeCaseObject.camelCase(data)
      const index = state[listingResourceName(resourceWithNamespace)].map(x => x.id).indexOf(data.id)
      const resources = state[listingResourceName(resourceWithNamespace)].filter(x => x.id != data.id)
      if (index === -1) {
        resources.push(data)
      } else {
        resources.splice(index, 0, data)
      }
      state[listingResourceName(resourceWithNamespace)] = resources
    }
  }

  const showMutations = {
    [snake_toCamel(`set_${showingResourceName(resourceWithNamespace)}`)](state, data) {
      state[showingResourceName(resourceWithNamespace)] = changeCaseObject.camelCase(data)
      state.shouldRefreshShowState = false
    },
    [snake_toCamel(`invalidate_${showingResourceName(resourceWithNamespace)}`)](state) {
      state.shouldRefreshShowState = true
    }
  }

  const newMutations = {
    [snake_toCamel(`set_initializing_${showingResourceName(resourceWithNamespace)}`)](state, data) {
      state[initializingResourceName(resourceWithNamespace)] = changeCaseObject.camelCase(
        data
      )
    }
  }

  const editMutations = {
    [snake_toCamel(`set_editing_${showingResourceName(resourceWithNamespace)}`)](state, data) {
      state[editingResourceName(resourceWithNamespace)] = changeCaseObject.camelCase(data)
    }
  }

  const destroyMutations = {
    // If exists 'id' property in record, remove record in index records
    [snake_toCamel(`remove_record_in_${listingResourceName(resourceWithNamespace)}`)](state, id) {
      if (!state[listingResourceName(resourceWithNamespace)]) {
        return
      }
      const resources = state[listingResourceName(resourceWithNamespace)].filter(x => x.id != id)
      state[listingResourceName(resourceWithNamespace)] = resources
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
