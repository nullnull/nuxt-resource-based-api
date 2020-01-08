import pluralize from 'pluralize'

const actionToMethod = {
    index: 'get',
    show: 'get',
    create: 'post',
    edit: 'get',
    update: 'put',
    destroy: 'delete',
}

const getQueryStrings = (query): string => {
    const queryString = Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')
    return queryString === '' ? '' : '?' + queryString
}

export default function(axios) {
    return async function (action, resource, query: object, headers, options, obj = {}) {
        const method = actionToMethod[action]
        const id = { id: undefined, ...query }.id

        if (action === 'index') {
            return await axios[method](`/${pluralize(resource)}${getQueryStrings(query)}`, {
                headers: headers
            })
        } else if (['create'].includes(action)) {
            return await axios[method](`/${pluralize(resource)}`, obj, {
                headers: headers
            })
        } else if (['show', 'destroy'].includes(action)) {
            const path = options.isSingular ? resource : `${pluralize(resource)}/${id}`
            return await axios[method](`/${path}`, {
                headers: headers
            })
        } else if (['edit'].includes(action)) {
            const path = options.isSingular ? `${resource}/edit` : `${pluralize(resource)}/${id}/edit`
            return await axios[method](`/${path}`, {
                headers: headers
            })
        } else if (['update'].includes(action)) {
            const path = options.isSingular ? resource : `${pluralize(resource)}/${id}`
            return await axios[method](`/${path}`, obj, {
                headers: headers
            })
        } else {
            throw 'Undefined action'
        }
    }
}
