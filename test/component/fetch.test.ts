import Napi from './../../src/index'

const mockContext = () => {
  return {
    store: {
      dispatch: jest.fn((actionName, payload) => { return {} })
    },
    route: {
      params: {},
      path: '/'
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
    test("it dispatches fetch actions for index with query", async () => {
      const ctx = {
        ...mockContext(),
        route: {
          params: {
            userId: 1,
          },
          path: '/users/1/articles'
        },
        query: {
          tagId: 3
        }
      };
      const resources = [
        { resource: "admin/article", action: "index" as const },
      ]
      const fetch = Napi.generateFetch(resources);

      await fetch(ctx);
      expect(ctx.store.dispatch.mock.calls.length).toBe(1);
      expect(ctx.store.dispatch).toHaveBeenCalledWith(
        "admin/article/fetchArticles",
        {
          headers: {},
          query: {
            tagId: 3,
            userId: 1,
          }
        }
      );
    });

    test("it dispatches fetch actions for show with query", async () => {
      const resources = [
        { resource: "admin/article", action: "show" as const },
      ]
      const fetch = Napi.generateFetch(resources);
      const ctx = {
        ...mockContext(),
        route: {
          params: {
            userId: 1,
            id: 2,
          },
          path: '/users/1/articles/2'
        },
        query: {
          tagId: 3
        }
      }

      await fetch(ctx);
      expect(ctx.store.dispatch.mock.calls.length).toBe(1);
      expect(ctx.store.dispatch).toHaveBeenCalledWith(
        "admin/article/fetchArticle",
        {
          headers: {},
          query: {
            id: 2,
          }
        }
      );
    });

    test("it dispatches fetch actions for show with query", async () => {
      const resources = [
        { resource: "admin/user", action: "show" as const },
      ]
      const fetch = Napi.generateFetch(resources);
      const ctx = {
        ...mockContext(),
        route: {
          params: {
            userId: 1,
            id: 2,
          },
          path: '/users/1/articles/2'
        },
        query: {
          tagId: 3
        }
      }

      await fetch(ctx);
      expect(ctx.store.dispatch.mock.calls.length).toBe(1);
      expect(ctx.store.dispatch).toHaveBeenCalledWith(
        "admin/user/fetchUser",
        {
          headers: {},
          query: {
            id: 1,
          }
        }
      );
    });

    test("it dispatches fetch actions for show for singular resource with query", async () => {
      const resources = [
        { resource: "admin/me", action: "show" as const },
      ]
      const fetch = Napi.generateFetch(resources);
      const ctx = {
        ...mockContext(),
        route: {
          params: {
            userId: 1,
            id: 2,
          },
          path: '/users/1/articles/2'
        },
        query: {
          tagId: 3
        }
      }

      await fetch(ctx);
      expect(ctx.store.dispatch.mock.calls.length).toBe(1);
      expect(ctx.store.dispatch).toHaveBeenCalledWith(
        "admin/me/fetchMe",
        {
          headers: {},
          query: {}
        }
      );
    });
  });
});
