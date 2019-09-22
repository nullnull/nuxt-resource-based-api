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
      }
      // const src = `({
      //   ${name}() { console.log('this'); console.log(this); return this.$store.state.${r.resource}.${name} }
      // })`
      // console.log(src);
      // return eval(src)
      return {
        [name]: () => { return this.$store.state[r.resource][name] }
      }
    })
    .filter(x => x)
    .reduce((acc, x) => Object.assign(x, acc), {})
}

export default generateComputed