import pluralize from 'pluralize'
import { cloneDeep } from 'lodash'
import changeCaseObject from 'change-case-object'
import {
  camelTo_snake,
  snake_toCamel,
  editingResourceName,
  initializingResourceName,
  createActionName,
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
    async [createActionName(resource, 'index')]({ commit, state }, { force: force, query: query, headers: headers }) {
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
      commit(snake_toCamel(`set_${pluralize(resource)}`), data)
    },
    [snake_toCamel(`invalidate_${pluralize(resource)}`)]({ commit }) {
      commit(snake_toCamel(`invalidate_${pluralize(resource)}`))
    }
  }

  const showActionForSingularResource = {
    async [createActionName(resource, 'show')]({ commit, state }, { force: force, query: query, headers: headers }) {
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
      commit(snake_toCamel(`set_${resource}`), data)
    },
    [snake_toCamel(`invalidate_${resource}`)]({ commit }) {
      commit(snake_toCamel(`invalidate_${resource}`))
    }
  }

  const showActionForResources = {
    async [createActionName(resource, 'show')]({ commit, dispatch, state }, { id: id, force: force, query: query, headers: headers }) {
      if (config.useIndexActionInShowAction) {
        if (state.shouldRefreshIndexState) {
          await dispatch(createActionName(resource, 'index'), { force: force, query: query, headers: headers })
        }
        const data = state[resources].find(x => x.id == id)
        if (data === undefined) {
          throw 404
        }
        commit(snake_toCamel(`set_${resource}`), data)
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
        commit(snake_toCamel(`set_${resource}`), data)
      }
    },
    [snake_toCamel(`invalidate_${resource}`)]({ commit }) {
      commit(snake_toCamel(`invalidate_${resource}`))
    }
  }

  const editAction = {
    async [createActionName(resource, 'edit')]({ commit, dispatch, state }, { id: id, force: force, query: query, headers: headers }) {
      if (state[editingName] && state[editingName].id == id && !config.refreshPropertiesAlways) {
        return
      }

      if (config.useShowActionInEditAction) {
        if (!state[resource] || state[resource].id != id) {
          await dispatch(createActionName(resource, 'show'), { id: id, force: force, query: query, headers: headers })
        }
        commit(snake_toCamel(`set_editing_${resource}`), cloneDeep(state[resource]))
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
        commit(snake_toCamel(`set_editing_${resource}`), cloneDeep(data))
      }
    },
    async [createActionName(resource, 'update')]({ commit, state }, { query: query, headers: headers }) {
      const obj = changeCaseObject.snakeCase(state[editingName])
      const { data } = await requestCallback(
        'update',
        camelTo_snake(resource),
        isSingular ? query : { ...query, id: state[editingName].id },
        headers,
        {
          isSingular: isSingular
        },
        { [camelTo_snake(resource)]: obj }
      )

      if (actions.includes('show')) {
        commit(snake_toCamel(`set_${resource}`), data)
      }
      if (actions.includes('index')) {
        commit(snake_toCamel(`refresh_record_in_${pluralize(resource)}`), data)
      }
      return changeCaseObject.camelCase(data)
    }
  }

  const newAction = {
    async [createActionName(resource, 'new')]({ commit, state }) {
      if (state[initializingName] && !config.refreshPropertiesAlways) {
        return
      }
      const newObj = {}
      commit(snake_toCamel(`set_initializing_${resource}`), newObj)
    },
    async [createActionName(resource, 'create')]({ commit, state }, { query: query, headers: headers }) {
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
        commit(snake_toCamel(`set_${resource}`), data)
      }
      if (actions.includes('index')) {
        commit(snake_toCamel(`refresh_record_in_${pluralize(resource)}`), data)
      }
      return changeCaseObject.camelCase(data)
    }
  }

  const destroyAction = {
    async [createActionName(resource, 'destroy')]({ commit }, { id: id, query: query, headers: headers }) {
      await requestCallback(
        'destroy',
        camelTo_snake(resource),
        { ...query, id: id },
        headers,
        {
          isSingular: isSingular
        }
      )
      commit(snake_toCamel(`remove_record_in_${pluralize(resource)}`), id)
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
