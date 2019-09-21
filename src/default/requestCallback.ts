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

function camelTo_snake(str) {
    return str.replace(/[A-Z]/g, match => '_' + match.toLowerCase())
}

const objectMap = function (obj: object, f: (any) => any) {
    return Object.entries(obj).map(([k, v]) => f([k, v]))
}

function generatePathWithQuery(resources: string, query: object | undefined) {
    if (query === undefined) {
        return camelTo_snake(resources)
    } else {
        return camelTo_snake(resources) + '?' + objectMap(query, ([k, v]) => `${k}=${v}`).join("&") // TODO
    }
}

export default function(apiUrl) {
    return async function (action, resource, query, headers, options, obj = {}) {
        const method = actionToMethod[action]
        if (action === 'index') {
            return await axios[method](`${apiUrl}/${generatePathWithQuery(pluralize(resource), query)}`, {
                headers: headers
            })
        } else if (['create'].includes(action)) {
            return await axios[method](`${apiUrl}/${pluralize(resource)}`, obj, {
                headers: headers
            })
        } else if (['show', 'destroy'].includes(action)) {
            const path = options.isSingular ? resource : `${pluralize(resource)}/${query.id}`
            return await axios[method](`${apiUrl}/${path}`, {
                headers: headers
            })
        } else if (['edit'].includes(action)) {
            const path = options.isSingular ? `${pluralize(resource)}/edit` : `${pluralize(resource)}/${query.id}/edit`
            return await axios[method](`${apiUrl}/${path}`, {
                headers: headers
            })
        } else if (['update'].includes(action)) {
            const path = options.isSingular ? `${pluralize(resource)}` : `${pluralize(resource)}/${query.id}`
            return await axios[method](`${apiUrl}/${path}`, obj, {
                headers: headers
            })
        } else {
            throw 'Undefined action'
        }
    }
}
