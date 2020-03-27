import queryHandler from './../../src/default/queryHandler'

function sharedTest(resource, action, context, expected) {
  test('it extracts valid queries from path', () => {
    const query = queryHandler(resource, action, context)
    expect(query).toEqual(expected)
  })
}

describe('default query handler', () => {
  describe('index action', () => {
    sharedTest('user', 'index', {
      query: {},
      route: {
        params: {},
        path: '/users'
      },
    }, {})

    sharedTest('comment', 'index', {
      query: {},
      route: {
        params: { userId: 1 },
        path: '/users/1/comments'
      },
    }, { userId: 1 })

    sharedTest('comment', 'index', {
      query: {},
      route: {
        params: { userId: 1 },
        path: '/users/1/comments/'
      },
    }, { userId: 1 })
  })

  describe('show action', () => {
    sharedTest('user', 'show', {
      query: {},
      route: {
        params: { id: 1 },
        path: '/users/1'
      },
    }, { id: 1 })

    sharedTest('user', 'show', {
      query: {},
      route: {
        params: { userId: 1 },
        path: '/users/1'
      },
    }, { id: 1 })

    sharedTest('user', 'show', {
      query: {},
      route: {
        params: {
          userId: 1,
          id: 2,
        },
        path: '/users/1/comments/2',
      },
    }, { id: 1 })

    sharedTest('comment', 'show', {
      query: {},
      route: {
        params: {
          userId: 1,
          id: 2,
        },
        path: '/users/1/comments/2',
      },
    }, { id: 2 })
  })

  describe('edit action', () => {
    sharedTest('user', 'edit', {
      query: {},
      route: {
        params: { id: 1 },
        path: '/users/1/edit'
      },
    }, { id: 1 })

    sharedTest('user', 'edit', {
      query: {},
      route: {
        params: { userId: 1 },
        path: '/users/1/edit'
      },
    }, { id: 1 })

    sharedTest('comment', 'edit', {
      query: {},
      route: {
        params: {
          userId: 1,
          id: 2,
        },
        path: '/users/1/comments/2/edit',
      },
    }, { id: 2 })
  })
})
