import Napi from './../../src/index'

function mockedContext(state, commit) {
  return {
    commit,
    state
  }
}

const mockedAxios = {
  get() {},
  post() {},
  put() {},
  delete() {},
}

Napi.setConfig({
  axios: mockedAxios
});
const responseBody = { body: 'body' }

function sharedTests(actions, state, apiNamespace) {
  test('send get request to show records', async () => {
    const commit = jest.fn()

    await (actions as any).fetchArticles(mockedContext(state, commit), { force: true })
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiNamespace}/articles`,
      { "headers": undefined }
    )
    expect(commit).toHaveBeenCalledWith("setArticles", { query: undefined, records: responseBody })
  });

  test('send get request to show record', async () => {
    const commit = jest.fn()

    const id = 1
    await (actions as any).fetchArticle(mockedContext(state, commit), { id: id, force: true })
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiNamespace}/articles/${id}`,
      { "headers": undefined }
    )
    expect(commit).toHaveBeenCalledWith("setArticle", responseBody)
  })

  test('send post request', async () => {
    const commit = jest.fn()

    const record = {
      id: 1,
      name: 'name1'
    }
    await (actions as any).createArticle(mockedContext(state, commit), { record })
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${apiNamespace}/articles`,
      { "article": record },
      { "headers": undefined }
    )
    expect(commit).toHaveBeenCalledWith("setArticle", responseBody)
    expect(commit).toHaveBeenCalledWith("refreshRecordInArticles", responseBody)
  });

  test('send put request', async () => {
    const commit = jest.fn()
  
    const record = {
      id: 1,
      name: 'name1'
    }
    await (actions as any).updateArticle(mockedContext(state, commit), { record })
    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${apiNamespace}/articles/${record.id}`,
      { "article": record },
      { "headers": undefined }
    )
    expect(commit).toHaveBeenCalledWith("setArticle", responseBody)
    expect(commit).toHaveBeenCalledWith("refreshRecordInArticles", responseBody)
  });

  test('send delete request', async () => {
    const commit = jest.fn()

    const id = 1
    await (actions as any).destroyArticle(mockedContext(state, commit), { id })
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${apiNamespace}/articles/${id}`,
      { "headers": undefined }
    )
    expect(commit).toHaveBeenCalledWith("removeRecordInArticles", id)
  });
}

describe('actions of createStore', () => {
  beforeEach(() => {
    (mockedAxios as any).get = jest.fn((_url, _options) => { return { data: responseBody } });
    (mockedAxios as any).post = jest.fn((_url, _body, _options) => { return { data: responseBody } });
    (mockedAxios as any).delete = jest.fn((_url, _options) => { return {} });
    (mockedAxios as any).put = jest.fn((_url, _body, _options) => { return { data: responseBody } });
  });

  describe('with no namespace', () => {
    const { actions, state } = Napi.createStore(
      'article',
      ['index', 'show', 'new', 'edit', 'destroy']
    );

    sharedTests(actions, state, '')
  })

  describe('with resource with namespace', () => {
    const { actions, state } = Napi.createStore(
      'admin/article',
      ['index', 'show', 'new', 'edit', 'destroy']
    );

    sharedTests(actions, state, `/admin`) // call url with namespace
  })
})
