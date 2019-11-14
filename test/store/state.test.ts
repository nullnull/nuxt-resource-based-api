import Napi from './../../src/index'

describe('createStore', () => {
  test('creates state', () => {
    const { state } = Napi.createStore(
      'article',
      ['index', 'show', 'new', 'edit', 'destroy']
    )
    expect(state()).toEqual({
      shouldRefreshIndexState: true,
      shouldRefreshShowState: true,
      article: null,
      articles: [],
      editingArticle: null,
      initializingArticle: null
    })
  })

  describe('with resource with namespace', () => {
    test('creates state without namespace', () => {
      const { state } = Napi.createStore(
        'admin/article',
        ['index', 'show', 'new', 'edit', 'destroy']
      )
      expect(state()).toEqual({
        shouldRefreshIndexState: true,
        shouldRefreshShowState: true,
        article: null,
        articles: [],
        editingArticle: null,
        initializingArticle: null
      })
    })
  })
})

