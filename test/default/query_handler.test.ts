import queryHandler from './../../src/default/queryHandler'

function sharedTest(resource, action, path, expected) {
  test('with no namespace', () => {
    const context = {
      query: {},
      route: {
        params: { id: 1 },
        path: path
      },
      
    }
    const query = queryHandler(resource, action, context)
    expect(query).toEqual(expected)
  })
}

describe('actions of createStore', () => {
  sharedTest('article', 'show', '/articles/1', { id: 1 })
  sharedTest('article', 'show', '/articles/1/comments/2', { id: 1 })
  sharedTest('article', 'show', '/users/2/articles/1', { id: 1 })

  sharedTest('article', 'edit', '/articles/1/edit', { id: 1 })
  sharedTest('article', 'edit', '/articles/1/edit?foo=2', { id: 1 })
})
