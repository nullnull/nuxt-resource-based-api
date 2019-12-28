import pluralize from 'pluralize'
import { URLSearchParams } from 'url'

const actionToMethod = {
    index: 'get',
    show: 'get',
    create: 'post',
    edit: 'get',
    update: 'put',
    destroy: 'delete',
}

const getQueryStrings = (query): string => {
    const searchParams = new (URLSearchParams || window.URLSearchParams)('')
    Object.entries(query).forEach(([k, v]) => searchParams.append(k, v as string))
    return searchParams.toString() === '' ? '' : '?' + searchParams.toString()
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
