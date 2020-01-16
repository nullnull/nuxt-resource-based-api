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
  sharedTest('sharedArticle', 'show', '/shared_articles/1', { id: 1 })
  sharedTest('sharedArticle', 'show', '/shared_articles/1/comments/2', { id: 1 })
  sharedTest('sharedArticle', 'show', '/users/2/shared_articles/1', { id: 1 })

  sharedTest('sharedArticle', 'edit', '/shared_articles/1/edit', { id: 1 })
  sharedTest('sharedArticle', 'edit', '/shared_articles/1/edit?foo=2', { id: 1 })
})
