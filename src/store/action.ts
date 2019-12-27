import pluralize from 'pluralize'
import { cloneDeep } from 'lodash'
import changeCaseObject from 'change-case-object-chmurson'
import {
  camelTo_snake,
  snake_toCamel,
  editingResourceName,
  initializingResourceName,
  createActionName,
  listingResourceName,
  showingResourceName,
} from '../util'
import { Action, ActionConfig, ActionExtension } from '../index'

export default function generateActionsWithAuth(
  resourceWithNamespace: string,
  actions: Action[],
  requestCallback: Function,
  extention: ActionExtension = {},
  config: ActionConfig
) {
  const resource = showingResourceName(resourceWithNamespace)
  const resources = listingResourceName(resourceWithNamespace)
  const editingName = editingResourceName(resourceWithNamespace)
  const initializingName = initializingResourceName(resourceWithNamespace)
  const isSingular = config.isSingular || false

  if (config.useShowActionInEditAction && actions.includes('edit') && !actions.includes('show')) {
    throw `${resource} must have show action if you want to useShowActionInEditAction be true `
  }

  const indexAction = {
    async [createActionName(resource, 'index')]({ commit, state }, { force: force, query: query, headers: headers }) {

      if (!state.shouldRefreshIndexState && !force) {
        return
      }
      const { data } = await requestCallback(
        "index",
        camelTo_snake(resourceWithNamespace),
        query || {},
        headers,
        {
          isSingular: isSingular
        }
      );

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
        "show",
        camelTo_snake(resourceWithNamespace),
        query || {},
        headers,
        {
          isSingular: isSingular
        }
      );
      commit(snake_toCamel(`set_${resource}`), data)
    },
    [snake_toCamel(`invalidate_${resource}`)]({ commit }) {
      commit(snake_toCamel(`invalidate_${resource}`))
    }
  }

  const showActionForResources = {
    async [createActionName(resource, 'show')]({ commit, dispatch, state }, { id: id, force: force, query: query, headers: headers }) {
      id = id || query.id;
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
          "show",
          camelTo_snake(resourceWithNamespace),
          { ...query, id: id },
          headers,
          {
            isSingular: isSingular
          }
        );
        commit(snake_toCamel(`set_${resource}`), data)
      }
    },
    [snake_toCamel(`invalidate_${resource}`)]({ commit }) {
      commit(snake_toCamel(`invalidate_${resource}`))
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
  }

  const createAction = {
    async [createActionName(resource, 'create')]({ commit, state }, { query: query, headers: headers, record: record }) {
      const { data } = await requestCallback(
        "create",
        camelTo_snake(resourceWithNamespace),
        query || {},
        headers,
        {
          isSingular: isSingular
        },
        {
          [camelTo_snake(resource)]: changeCaseObject.snakeCase(
            record || state[initializingName]
          )
        }
      );

      if (actions.includes('show')) {
        commit(snake_toCamel(`set_${resource}`), data)
      }
      if (actions.includes('index')) {
        commit(snake_toCamel(`refresh_record_in_${pluralize(resource)}`), data)
      }
      return changeCaseObject.camelCase(data)
    }
  }

  const editAction = {
    async [createActionName(resource, 'edit')]({ commit, dispatch, state }, { id: id, force: force, query: query, headers: headers }) {
      id = id || query.id
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
          "edit",
          camelTo_snake(resourceWithNamespace),
          { ...query, id: id },
          headers,
          {
            isSingular: isSingular
          }
        );
        commit(snake_toCamel(`set_editing_${resource}`), cloneDeep(data))
      }
    },
  }

  const updateAction = {
    async [createActionName(resource, 'update')]({ commit, state }, { query: query, headers: headers, record: record }) {
      const { data } = await requestCallback(
        'update',
        camelTo_snake(resourceWithNamespace),
        isSingular ? query : { ...query, id: (record || state[editingName]).id },
        headers,
        {
          isSingular: isSingular
        },
        { [camelTo_snake(resource)]: changeCaseObject.snakeCase(record || state[editingName]) }
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
      id = id || query.id;
      await requestCallback(
        "destroy",
        camelTo_snake(resourceWithNamespace),
        { ...query, id: id },
        headers,
        {
          isSingular: isSingular
        }
      );
      commit(snake_toCamel(`remove_record_in_${pluralize(resource)}`), id)
    }
  }

  const showAction = isSingular ? showActionForSingularResource : showActionForResources

  return {
    ...(actions.includes('index') ? indexAction : {}),
    ...(actions.includes('show') ? showAction : {}),
    ...(actions.includes('new') ? newAction : {}),
    ...(actions.includes('new') || actions.includes('create') ? createAction : {}),
    ...(actions.includes('edit') ? editAction : {}),
    ...(actions.includes('edit') || actions.includes('update') ? updateAction : {}),
    ...(actions.includes('destroy') ? destroyAction : {}),
    ...extention
  }
}
