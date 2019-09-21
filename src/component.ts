import Vue from 'vue'
import generateComputed from './component/computed'
import generateMethods from './component/methods'
import generateFetch from './component/fetch'
import { Action } from './index'

interface Options { }
export interface Resource {
  resource: string
  action: Action
  options?: Options
}
interface Data {}
interface Methods {}
interface Props {}

export function resourcefulComponent<Resources>(resources: Array<Resource> = []) {
  return Vue.extend<Data, Methods, Resources, Props>({
    computed: generateComputed(resources) as unknown as Resources,
    methods: generateMethods(resources) as unknown as Resources,
  })
}

export function resourcefulPageComponent<T>(resources: Array<Resource> = []) {
  return resourcefulComponent<T>(resources).extend({
    fetch: generateFetch(resources),
  } as object)
}
