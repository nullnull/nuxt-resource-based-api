import pluralize from 'pluralize'
import { cloneDeep } from 'lodash'
import changeCaseObject from 'change-case-object'
import {
  camelTo_snake,
  editingResourceName,
  initializingResourceName,
} from '../util'
import { Action, ActionConfig, ActionExtension } from '../index'

export default function generateActionsWithAuth(
  resource: string,
  actions: Action[],
  requestCallback: Function,
  extention: ActionExtension = {},
  options: ActionConfig = {}
) {
  const isSingular = options.isSingular || false
  const resources = pluralize(resource)
  const editingName = editingResourceName(resource)
  const initializingName = initializingResourceName(resource)

  const defaultConfig: ActionConfig = {
    useIndexActionInShowAction: true,
    useShowActionInEditAction: true,
    refreshPropertiesAlways: false,
    isSingular: false
  }
  const config: ActionConfig = {
    ...defaultConfig,
    ...options
  }

  if (config.useShowActionInEditAction && actions.includes('edit') && !actions.includes('show')) {
    throw `${resource} must have show action if you want to useShowActionInEditAction be true `
  }

  const indexAction = {
    async index({ commit, state }, { force: force, query: query, headers: headers }) {
      if (!state.shouldRefreshIndexState && !force) {
        return
      }
      const { data } = await requestCallback(
        'index',
        camelTo_snake(resource),
        query,
        headers,
        {
          isSingular: isSingular
        }
      )
      commit('setIndexResponse', data)
    },
    invalidateIndexState({ commit }) {
      commit('invalidateIndexState')
    }
  }

  const showActionForSingularResource = {
    async show({ commit, state }, { force: force, query: query, headers: headers }) {
      if (!state.shouldRefreshShowState && !force) {
        return
      }
      const { data } = await requestCallback(
        'show',
        camelTo_snake(resource),
        query,
        headers,
        {
          isSingular: isSingular
        }
      )
      commit('setShowResponse', data)
    },
    invalidateShowState({ commit }) {
      commit('invalidateShowState')
    }
  }

  const showActionForResources = {
    async show({ commit, dispatch, state }, { id: id, force: force, query: query, headers: headers }) {
      if (config.useIndexActionInShowAction) {
        if (state.shouldRefreshIndexState) {
          await dispatch(`index`, { force: force, query: query, headers: headers })
        }
        const data = state[resources].find(x => x.id == id)
        if (data === undefined) {
          throw 404
        }
        commit('setShowResponse', data)
      } else {
        const hasResource = state[resource] && state[resource].id === id
        if (hasResource && !state.shouldRefreshShowState && !force) {
          return
        }
        const { data } = await requestCallback(
          'show',
          camelTo_snake(resource),
          { ...query, id: id },
          headers,
          {
            isSingular: isSingular
          }
        )
        commit('setShowResponse', data)
      }
    },
    invalidateShowState({ commit }) {
      commit('invalidateShowState')
    }
  }

  const editAction = {
    async edit({ commit, dispatch, state }, { id: id, force: force, query: query, headers: headers }) {
      if (state[editingName] && state[editingName].id == id && !config.refreshPropertiesAlways) {
        return
      }

      if (config.useShowActionInEditAction) {
        if (!state[resource] || state[resource].id != id) {
          await dispatch('show', { id: id, force: force, query: query, headers: headers })
        }
        commit('initializeEditingData', cloneDeep(state[resource]))
      } else {
        const { data } = await requestCallback(
          'edit',
          camelTo_snake(resource),
          { ...query, id: id },
          headers,
          {
            isSingular: isSingular
          }
        )
        commit('initializeEditingData', cloneDeep(data))
      }
    },
    async update({ commit, state }, { query: query, headers: headers }) {
      const obj = changeCaseObject.snakeCase(state[editingName])
      const url = isSingular ? `${camelTo_snake(resource)}` : `${camelTo_snake(resources)}/${state[editingName].id}`
      const { data } = await requestCallback(
        'update',
        camelTo_snake(resource),
        query,
        headers,
        {
          isSingular: isSingular
        },
        { [camelTo_snake(resource)]: obj }
      )

      if (actions.includes('show')) {
        commit('setShowResponse', data)
      }
      if (actions.includes('index')) {
        commit('refreshRecordInIndexState', data)
      }
      return changeCaseObject.camelCase(data)
    }
  }

  const newAction = {
    async new({ commit, state }) {
      if (state[initializingName] && !config.refreshPropertiesAlways) {
        return
      }
      const newObj = {}
      commit('initializeInitializingData', newObj)
    },
    async create({ commit, state }, { query: query, headers: headers }) {
      const obj = changeCaseObject.snakeCase(state[initializingName])
      const { data } = await requestCallback(
        'create',
        camelTo_snake(resource),
        query,
        headers,
        {
          isSingular: isSingular
        },
        { [camelTo_snake(resource)]: obj }
      )

      if (actions.includes('show')) {
        commit('setShowResponse', data)
      }
      if (actions.includes('index')) {
        commit('refreshRecordInIndexState', data)
      }
      return changeCaseObject.camelCase(data)
    }
  }

  const destroyAction = {
    async destroy({ commit }, { id: id, query: query, headers: headers }) {
      await requestCallback(
        'destroy',
        camelTo_snake(resource),
        { ...query, id: id },
        headers,
        {
          isSingular: isSingular
        }
      )
      commit('removeRcordInIndexState', id)
    }
  }

  const showAction = isSingular ? showActionForSingularResource : showActionForResources

  return {
    ...(actions.includes('index') ? indexAction : {}),
    ...(actions.includes('edit') ? editAction : {}),
    ...(actions.includes('new') ? newAction : {}),
    ...(actions.includes('destroy') ? destroyAction : {}),
    ...(actions.includes('show') ? showAction : {}),
    ...extention
  }
}
