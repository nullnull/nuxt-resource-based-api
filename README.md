# nuxt-resource-based-api
[![npm version](https://badge.fury.io/js/nuxt-resource-based-api.svg)](https://badge.fury.io/js/nuxt-resource-based-api)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

This library provide extremely efficient way to handle API which has resource based routing (like Ruby on Rails) on Nuxt.js.
You can implement vuex stores and vue components with simple and DRY code.

## Overview
Let's assume you want to develop a task management service, and you've already developed API server.

With this library, you can implement state/mutations/actions by following simple code.


**store/index.js**
```js
import Vapi from 'nuxt-resource-based-api'

Vapi.setConfig({
  apiUrl: 'https://api.awesome-task-manager.com'
})
```

**store/task.js**

```js
import Vapi from 'nuxt-resource-based-api'

export const { state, mutations, actions } = Vapi.createStore(
  'task',
  ['index', 'show', 'new', 'edit', 'destroy'],
)
```

That's it! And in addition to creating vuex store, you can create vue component.

**lib/create_component.js**

```js
import Vue from 'vue'
import Vapi from 'nuxt-resource-based-api'

export default function createComponent(resources) {
  return Vue.extend({
    fetch: Vapi.generateFetch(resources),
    computed: Vapi.generateComputed(resources)
    methods: Vapi.generateMethods(resources)
  })
}
```

**pages/index.vue**

```html
<script>
import createComponent from '@/lib/create_component'

export default createComponent([
  { resource: 'task', action: 'index' },
]).extend({ // you can define other option by using Vue.extend method
  methods: {
    foo() { return 1 }
  }
})
</script>

<template>
<div>
  <div class="task" v-for="task in tasks">
    {{ task.name }}
  </div>
</div>
</template>
```

By using `createComponent` function, you can omit boring `fetch` and `mapState` implementation and keep your source code simple. This is syntax sugar of following.

```js
// you can implement these callbakcks in configuration step
const createHeaders = (context) => { return {} }
const errorHandler = (e, context) => {}

export default Vue.extend({
  fetch(context) {
    const headers = createHeaders(context)
    const { store } = context
    try {
      await store.dispatch('task/fetchTasks', { headers }) // send a request (GET https://api.awesome-task-manager.com/tasks) and store the response
    } catch (e) {
      errorHandler(e, context)
    }
  },
  computed: {
    tasks() {
      return this.$store.state.task.tasks
    }
  },
  methods: {
    fetchTasks(force = false) {
      const headers = createHeaders(this)
      try {
        await store.dispatch('task/fetchTasks', { headers, force })
      } catch(e) {
        errorHandler(e, this)
      }
    },
    foo() { return 1 }
  }
})
```

If you want to implement a page to create task, write following code.

**pages/tasks/new.vue**

```html
<script>
import createComponent from '@/lib/create_component'

export default createComponent([
  { resource: 'task', action: 'create' },
]).extend({
  data() {
    return {
      title: '',
      body: '',
    }
  },
  methods: {
    async create() {
      await this.createTask({
        title: this.title,
        body: this.body
      })
    }
  }
})
</script>

<template>
<!-- ... -->
</template>
```

[See other examples in Wiki](https://github.com/nullnull/nuxt-resource-based-api/wiki/Examples).


## Installation
```js
npm install nuxt-resource-based-api
```

As minimum configuration, all you need to do just add following code.

```js
// store/index.js
import Vapi from 'nuxt-resource-based-api'

Vapi.setConfig({
    apiUrl: 'https://api.awesome-task-manager.com'
})
```

```js
// lib/create_component.js
import Vue from 'vue'
import Vapi from 'nuxt-resource-based-api'

export default function createComponent(resources) {
  return Vue.extend({
    fetch: Vapi.generateFetch(resources),
    computed: Vapi.generateComputed(resources)
    methods: Vapi.generateMethods(resources)
  })
}
```

You can also customize request handler, error handler and so on. [Please see Wiki](https://github.com/nullnull/nuxt-resource-based-api/wiki/Configuration)

# Typescript Support
Unfortunately Typescript is incompatible to dynamic generating codes like this library.
But you can use typescript with some trick and we recommend to use typescript. See [Wiki](https://github.com/nullnull/nuxt-resource-based-api/wiki/Typescript-support) for details.

