import pluralize from 'pluralize'
import { mapState } from 'vuex'

import { editingResourceName, initializingResourceName } from '../util'
import { Resource } from '../component';

export default function generateComputed(resources: Resource[]) {
  return resources
    .map(r => {
      if (r.action === 'show') {
        return mapState(r.resource, [r.resource])
      } else if (r.action === 'index') {
        return mapState(r.resource, [pluralize(r.resource)])
      } else if (r.action === 'edit') {
        return mapState(r.resource, [editingResourceName(r.resource)])
      } else if (r.action === 'new') {
        return mapState(r.resource, [initializingResourceName(r.resource)])
      }
    })
    .filter(x => x)
    .reduce((acc, x) => Object.assign(x, acc), {})
}
