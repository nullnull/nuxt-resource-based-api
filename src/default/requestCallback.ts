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

function generatePathWithQuery(resources: string, query: object | undefined) {
    if (query === undefined) {
        return camelTo_snake(resources)
    } else {
        // TODO
        return camelTo_snake(resources)
        // return camelTo_snake(resources) + '?' + query.objectMap(([k, v]) => `${k}=${v}`).join("&")
    }
}

export default async function (this: any, action, resource, query, headers, options, obj = {}) {
    console.log('defaultCallback');
    
    console.log(this);
    
    const method = actionToMethod[action]
    if (action === 'index') {
        return await axios[method](`${this.apiUrl}/${generatePathWithQuery(pluralize(resource), query)}`, {
            headers: headers
        })
    } else if (['create'].includes(action)) {
        return await axios[method](`${this.apiUrl}/${pluralize(resource)}`, obj, {
            headers: headers
        })
    } else if (['show', 'destroy'].includes(action)) {
        const path = options.isSingular ? resource : `${pluralize(resource)}/${query.id}`
        return await axios[method](`${this.apiUrl}/${path}`, {
            headers: headers
        })
    } else if (['edit'].includes(action)) {
        const path = options.isSingular ? `${pluralize(resource)}/edit` : `${pluralize(resource)}/${query.id}/edit`
        return await axios[method](`${this.apiUrl}/${path}`, {
            headers: headers
        })
    } else if (['update'].includes(action)) {
        const path = options.isSingular ? `${pluralize(resource)}` : `${pluralize(resource)}/${query.id}`
        return await axios[method](`${this.apiUrl}/${path}`, obj, {
            headers: headers
        })
    } else {
        throw 'Undefined action'
    }
}