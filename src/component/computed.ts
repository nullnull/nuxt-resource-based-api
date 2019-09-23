import pluralize from 'pluralize'
import { editingResourceName, initializingResourceName } from '../util'
import { Resource } from '../index';

const generateComputed = (resources: Resource[]) => {
  return resources
    .map(r => {
      let name = ""
      if (r.action === 'show') {
        name = r.resource
      } else if (r.action === 'index') {
        name = pluralize(r.resource)
      } else if (r.action === 'edit') {
        name = editingResourceName(r.resource)
      } else if (r.action === 'new') {
        name = initializingResourceName(r.resource)
      } else {
        return
      }
      // Use eval to avoid binding `this` to this closure
      const src = `({
        ${name}() { return this.$store.state.${r.resource}.${name} }
      })`
      return eval(src)
    })
    .filter(x => x)
    .reduce((acc, x) => Object.assign(x, acc), {})
}

export default generateComputed