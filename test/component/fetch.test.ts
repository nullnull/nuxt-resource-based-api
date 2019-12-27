import Napi from './../../src/index'

const mockContext = () => {
  return {
    store: {
      dispatch: jest.fn((actionName, payload) => { return {} })
    },
    route: {
      params: {}
    },
    query: {},
  }
}

const payload = {
  headers: {},
  query: {},
};

describe('generateFetch', () => {
  test('it dispatches fetch actions', async () => {
    const resources = [
      { resource: 'article', action: 'index' as const },
      { resource: 'article', action: 'show' as const },
      { resource: 'article', action: 'new' as const },
      { resource: 'article', action: 'edit' as const },
      { resource: 'article', action: 'destroy' as const },
    ]

    const fetch = Napi.generateFetch(resources)

    const ctx = mockContext()
    await fetch(ctx)
    expect(ctx.store.dispatch.mock.calls.length).toBe(4);
    expect(ctx.store.dispatch).toHaveBeenCalledWith("article/fetchArticles", payload)
    expect(ctx.store.dispatch).toHaveBeenCalledWith("article/fetchArticle", payload)
    expect(ctx.store.dispatch).toHaveBeenCalledWith("article/initializeArticle", payload)
  });

  describe('with resources with namespace', () => {
    test('it dispatches fetch actions with url with namespace', async () => {
      const resources = [
        { resource: 'admin/article', action: 'index' as const },
        { resource: 'admin/article', action: 'show' as const },
        { resource: 'admin/article', action: 'new' as const },
      ]

      const fetch = Napi.generateFetch(resources)

      const ctx = mockContext()
      await fetch(ctx)
      expect(ctx.store.dispatch.mock.calls.length).toBe(3);
      expect(ctx.store.dispatch).toHaveBeenCalledWith("admin/article/fetchArticles", payload)
      expect(ctx.store.dispatch).toHaveBeenCalledWith("admin/article/fetchArticle", payload)
      expect(ctx.store.dispatch).toHaveBeenCalledWith("admin/article/initializeArticle", payload)
    });
  })

  describe("with query and params", () => {
    test("it dispatches fetch actions with query and params", async () => {
      const resources = [
        { resource: "admin/article", action: "index" as const },
      ]

      const fetch = Napi.generateFetch(resources);

      const ctx = {
        store: {
          dispatch: jest.fn((actionName, payload) => {
            return {};
          })
        },
        route: {
          params: {
            foo: 1,
          }
        },
        query: {
          bar: 1
        }
      };
      await fetch(ctx);
      expect(ctx.store.dispatch.mock.calls.length).toBe(1);
      expect(ctx.store.dispatch).toHaveBeenCalledWith(
        "admin/article/fetchArticles",
        {
          headers: {},
          query: { bar: 1 }
        }
      );
    });
  });
});
