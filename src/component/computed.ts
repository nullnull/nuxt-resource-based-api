import { showingResourceName, listingResourceName, editingResourceName, initializingResourceName } from '../util'
import { Resource } from '../index';

export interface Computeds {
  [x: string]: () => any
}

function accessPropertyRecursively(obj, propertyNames) {
  if (propertyNames.length == 0) {
    return obj
  }
  return accessPropertyRecursively(obj[propertyNames[0]], propertyNames.slice(1, 1000))
}

const generateComputed = (resources: Resource[]) => {
  return resources
    .map(r => {
      let name = ""

      if (r.action === 'show') {
        name = showingResourceName(r.resource)
      } else if (r.action === 'index') {
        name = listingResourceName(r.resource)
      } else if (r.action === 'edit') {
        name = editingResourceName(r.resource)
      } else if (r.action === 'new') {
        name = initializingResourceName(r.resource)
      } else {
        return
      }
      return {
        [name]: function () { return accessPropertyRecursively(this.$store.state, [...r.resource.split('/'), name]) }
      }
    })
    .filter(x => x)
    .reduce((acc, x) => Object.assign(x, acc), {})
}

export default generateComputed