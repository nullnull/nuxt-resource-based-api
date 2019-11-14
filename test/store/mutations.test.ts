import Napi from './../../src/index'

function sharedTest(s, mutations) {
  const expectedArticle = {
    id: 1,
    name: 'name1'
  }
  const expectedArticles = [
    {
      id: 1,
      name: 'name1'
    },
    {
      id: 2,
      name: 'name2'
    },
  ]
  expect(s.articles).toEqual([]);
  (mutations as any).setArticles(s, expectedArticles);
  expect(s.articles).toEqual(expectedArticles)

  expect(s.article).toEqual(null);
  (mutations as any).setArticle(s, expectedArticle);
  expect(s.article).toEqual(expectedArticle)

  expect(s.editingArticle).toEqual(null);
  (mutations as any).setEditingArticle(s, expectedArticle);
  expect(s.editingArticle).toEqual(expectedArticle)

  expect(s.initializingArticle).toEqual(null);
  (mutations as any).setInitializingArticle(s, expectedArticle);
  expect(s.initializingArticle).toEqual(expectedArticle)

  s.shouldRefreshIndexState = false
  expect(s.shouldRefreshIndexState).toEqual(false);
  (mutations as any).invalidateArticles(s);
  expect(s.shouldRefreshIndexState).toEqual(true);

  s.shouldRefreshShowState = false
  expect(s.shouldRefreshShowState).toEqual(false);
  (mutations as any).invalidateArticle(s);
  expect(s.shouldRefreshShowState).toEqual(true);

  (mutations as any).refreshRecordInArticles(s, {
    id: 1,
    name: 'fixedName1'
  });
  expect(s.articles).toEqual([
    {
      id: 1,
      name: 'fixedName1'
    },
    {
      id: 2,
      name: 'name2'
    },
  ]);

  (mutations as any).removeRecordInArticles(s, 1);
  expect(s.articles).toEqual([
    {
      id: 2,
      name: 'name2'
    },
  ]);
}

describe('createStore', () => {
  test('creates mutations', () => {
    const { state, mutations } = Napi.createStore(
      'article',
      ['index', 'show', 'new', 'edit', 'destroy']
    )
    let s = state();

    sharedTest(s, mutations)
  })

  describe('with resource with namespace', () => {
    test('creates mutations without namespace', () => {
      const { state, mutations } = Napi.createStore(
        'admin/article',
        ['index', 'show', 'new', 'edit', 'destroy']
      )
      let s = state();
      
      sharedTest(s, mutations)
    })
  })
})

