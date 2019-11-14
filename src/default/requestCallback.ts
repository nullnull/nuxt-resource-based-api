import axios from 'axios'
import pluralize from 'pluralize'

const actionToMethod = {
    index: 'get',
    show: 'get',
    create: 'post',
    edit: 'get',
    update: 'put',
    destroy: 'delete',
}

const getQueryStringsForIndexAction = (query, params): string => {
    // as default, use only 'page' value in query
    if (query.page) {
        return `?page=${query.page}`;
    } else {
        return ''
    }
}

export default function(apiUrl) {
    return async function (action, resource, query: object, params: object, headers, options, obj = {}) {
        const method = actionToMethod[action]
        const id = { id: undefined, ...query, ...params }.id

        if (action === 'index') {
            return await axios[method](`${apiUrl}/${pluralize(resource)}${getQueryStringsForIndexAction(query, params)}`, {
                headers: headers
            })
        } else if (['create'].includes(action)) {
            return await axios[method](`${apiUrl}/${pluralize(resource)}`, obj, {
                headers: headers
            })
        } else if (['show', 'destroy'].includes(action)) {
            const path = options.isSingular ? resource : `${pluralize(resource)}/${id}`
            return await axios[method](`${apiUrl}/${path}`, {
                headers: headers
            })
        } else if (['edit'].includes(action)) {
            const path = options.isSingular ? `${resource}/edit` : `${pluralize(resource)}/${id}/edit`
            return await axios[method](`${apiUrl}/${path}`, {
                headers: headers
            })
        } else if (['update'].includes(action)) {
            const path = options.isSingular ? resource : `${pluralize(resource)}/${id}`
            return await axios[method](`${apiUrl}/${path}`, obj, {
                headers: headers
            })
        } else {
            throw 'Undefined action'
        }
    }
}
