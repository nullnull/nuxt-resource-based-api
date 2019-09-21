import pluralize from 'pluralize'
import { cloneDeep } from 'lodash'
import changeCaseObject from 'change-case-object'
import {
  camelTo_snake,
  editingResourceName,
  initializingResourceName,
  generatePathWithQuery
} from '../util'
import { Action, ActionConfig, ActionExtension } from '../../types'

import axios from 'axios'

async function requestWithToken(method, path, token, obj = {}) {
  if (!token) {
    throw 401
  }

  if (['get', 'delete'].includes(method)) {
    return await axios[method](`${process.env.apiUrl}/api/${path}`, {
      headers: {
        Authorization: token
      }
    })
  } else {
    return await axios[method](`${process.env.apiUrl}/api/${path}`, obj, {
      headers: {
        Authorization: token
      }
    })
  }
}

export default function generateActionsWithAuth(
  resource: string,
  actions: Action[],
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
    async index({ commit, state }, { token: token, force: force, query: query }) {
      if (!state.shouldRefreshIndexState && !force) {
        return
      }
      const { data } = await requestWithToken(
        'get',
        generatePathWithQuery(resources, query),
        token
      )
      commit('setIndexResponse', data)
    },
    invalidateIndexState({ commit }) {
      commit('invalidateIndexState')
    }
  }

  const showActionForSingularResource = {
    async show({ commit, state }, { token: token, force: force }) {
      if (!state.shouldRefreshShowState && !force) {
        return
      }
      const { data } = await requestWithToken(
        'get',
        camelTo_snake(resource),
        token
      )
      commit('setShowResponse', data)
    },
    invalidateShowState({ commit }) {
      commit('invalidateShowState')
    }
  }

  const showActionForResources = {
    async show({ commit, dispatch, state }, { id: id, token: token, force: force }) {
      if (config.useIndexActionInShowAction) {
        if (state.shouldRefreshIndexState) {
          await dispatch(`index`, { token: token })
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
        const { data } = await requestWithToken(
          'get',
          `${camelTo_snake(resources)}/${id}`,
          token
        )
        commit('setShowResponse', data)
      }
    },
    invalidateShowState({ commit }) {
      commit('invalidateShowState')
    }
  }

  const editAction = {
    async edit({ commit, dispatch, state }, { id: id, token: token }) {
      if (state[editingName] && state[editingName].id == id && !config.refreshPropertiesAlways) {
        return
      }

      if (config.useShowActionInEditAction) {
        if (!state[resource] || state[resource].id != id) {
          await dispatch('show', { id: id, token: token })
        }
        commit('initializeEditingData', cloneDeep(state[resource]))
      } else {
        const { data } = await requestWithToken(
          'get',
          `${camelTo_snake(resource)}/edit`,
          token
        )
        commit('initializeEditingData', cloneDeep(data))
      }
    },
    async update({ commit, state }, { token: token }) {
      const obj = changeCaseObject.snakeCase(state[editingName])
      const url = isSingular ? `${camelTo_snake(resource)}` : `${camelTo_snake(resources)}/${state[editingName].id}`
      const { data } = await requestWithToken(
        'put',
        url,
        token,
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
    async create({ commit, state }, { token: token }) {
      const obj = changeCaseObject.snakeCase(state[initializingName])
      const { data } = await requestWithToken(
        'post',
        camelTo_snake(resources),
        token,
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
    async destroy({ commit }, { id: id, token: token }) {
      await requestWithToken(
        'delete',
        `${camelTo_snake(resources)}/${id}`,
        token
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
