import pluralize from 'pluralize'
import changeCaseObject from 'change-case-object'
import { editingResourceName, initializingResourceName } from '../util'
import { Action, MutationExtension } from '../index'
import { snake_toCamel } from '../../dist/util'

export default function generateMutations(resource: string, actions: Action[], extension: MutationExtension = {}) {
  const indexMutation = {
    [snake_toCamel(`set_${pluralize(resource)}`)](state, data) {
      state[pluralize(resource)] = changeCaseObject.camelCase(data)
      state.shouldRefreshIndexState = false
    },
    [snake_toCamel(`invalidate_${pluralize(resource)}`)](state) {
      state.shouldRefreshIndexState = true
    },
    [snake_toCamel(`refresh_record_in_${pluralize(resource)}`)](state, data) {
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
    [snake_toCamel(`set_${resource}`)](state, data) {
      state[resource] = changeCaseObject.camelCase(data)
    },
    [snake_toCamel(`invalidate_${resource}`)](state) {
      state.shouldRefreshShowState = true
    }
  }

  const newMutations = {
    [snake_toCamel(`set_initializing_${resource}`)](state, data) {
      state[initializingResourceName(resource)] = changeCaseObject.camelCase(
        data
      )
    }
  }

  const editMutations = {
    [snake_toCamel(`set_editing_${resource}`)](state, data) {
      state[editingResourceName(resource)] = changeCaseObject.camelCase(data)
    }
  }

  const destroyMutations = {
    [snake_toCamel(`remove_record_in_${pluralize(resource)}`)](state, id) {
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
