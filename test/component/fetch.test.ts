import Napi from './../../src/index'
import { Resource } from '../../dist';

const mockContext = () => {
  return {
    store: {
      dispatch: jest.fn((actionName, payload) => { return {} })
    },
    route: {
      params: {
        id: 1
      }
    },
    query: undefined,
  }
}

describe('generateFetch', () => {
  test('it dispatches fetch actions', async () => {
    const resources = [
      { resource: 'article', action: 'index' },
      { resource: 'article', action: 'show' },
      { resource: 'article', action: 'new' },
      { resource: 'article', action: 'edit' },
      { resource: 'article', action: 'destroy' },
    ] as Resource[]

    const fetch = Napi.generateFetch(resources)

    const ctx = mockContext()
    await fetch(ctx)
    expect(ctx.store.dispatch).toHaveBeenCalledWith("article/fetchArticles", { "headers": {} })
    expect(ctx.store.dispatch).toHaveBeenCalledWith("article/fetchArticle", { "headers": {}, "id": 1 })
    expect(ctx.store.dispatch).toHaveBeenCalledWith("article/initializeArticle", { "headers": {} })
  });

  describe('with resources with namespace', () => {
    test('it dispatches fetch actions with url with namespace', async () => {
      const resources = [
        { resource: 'admin/article', action: 'index' },
        { resource: 'admin/article', action: 'show' },
        { resource: 'admin/article', action: 'new' },
      ] as Resource[]

      const fetch = Napi.generateFetch(resources)

      const ctx = mockContext()
      await fetch(ctx)
      expect(ctx.store.dispatch).toHaveBeenCalledWith("admin/article/fetchArticles", { "headers": {} })
      expect(ctx.store.dispatch).toHaveBeenCalledWith("admin/article/fetchArticle", { "headers": {}, "id": 1 })
      expect(ctx.store.dispatch).toHaveBeenCalledWith("admin/article/initializeArticle", { "headers": {} })
    });
  })
});
