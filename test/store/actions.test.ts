import Napi from './../../src/index'
import axios from 'axios'

function mockedContext(state, commit) {
  return {
    commit,
    state
  }
}

const apiUrl = 'http://localhost:99999/api'
Napi.setConfig({
  apiUrl
});
const responseBody = { body: 'body' }

function sharedTests(actions, state, apiUrlWithNamespace) {
  test('send get request to show records', async () => {
    const commit = jest.fn()

    await (actions as any).fetchArticles(mockedContext(state, commit), { force: true })
    expect(axios.get).toHaveBeenCalledWith(
      `${apiUrlWithNamespace}/articles`,
      { "headers": undefined }
    )
    expect(commit).toHaveBeenCalledWith("setArticles", { query: undefined, records: responseBody })
  });

  test('send get request to show record', async () => {
    const commit = jest.fn()

    const id = 1
    await (actions as any).fetchArticle(mockedContext(state, commit), { id: id, force: true })
    expect(axios.get).toHaveBeenCalledWith(
      `${apiUrlWithNamespace}/articles/${id}`,
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
    expect(axios.post).toHaveBeenCalledWith(
      `${apiUrlWithNamespace}/articles`,
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
    expect(axios.put).toHaveBeenCalledWith(
      `${apiUrlWithNamespace}/articles/${record.id}`,
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
    expect(axios.delete).toHaveBeenCalledWith(
      `${apiUrlWithNamespace}/articles/${id}`,
      { "headers": undefined }
    )
    expect(commit).toHaveBeenCalledWith("removeRecordInArticles", id)
  });
}

describe('actions of createStore', () => {
  beforeEach(() => {
    (axios as any).get = jest.fn((_url, _options) => { return { data: responseBody } });
    (axios as any).post = jest.fn((_url, _body, _options) => { return { data: responseBody } });
    (axios as any).delete = jest.fn((_url, _options) => { return {} });
    (axios as any).put = jest.fn((_url, _body, _options) => { return { data: responseBody } });
  });

  describe('with no namespace', () => {
    const { actions, state } = Napi.createStore(
      'article',
      ['index', 'show', 'new', 'edit', 'destroy']
    );

    sharedTests(actions, state, apiUrl)
  })

  describe('with resource with namespace', () => {
    const { actions, state } = Napi.createStore(
      'admin/article',
      ['index', 'show', 'new', 'edit', 'destroy']
    );

    sharedTests(actions, state, `${apiUrl}/admin`) // call url with namespace
  })
})
