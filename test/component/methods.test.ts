import Napi from './../../src/index'
import { Resource } from '../../dist';

const mockComponent = () => {
  return {
    $store: {
      dispatch: jest.fn((actionName, payload) => { return {} })
    },
  }
}

function sharedTest(namespace) {
  const resources = [
    { resource: `${namespace}article`, action: 'index' },
    { resource: `${namespace}article`, action: 'show' },
    { resource: `${namespace}article`, action: 'new' },
    { resource: `${namespace}article`, action: 'edit' },
    { resource: `${namespace}article`, action: 'destroy' },
  ] as Resource[]

  test('it generates method to dispatch fetch record action', async () => {
    const component = mockComponent()
    await Napi.generateMethods(resources).fetchArticle.call(component, 1)
    expect(component.$store.dispatch).toHaveBeenCalledWith(`${namespace}article/fetchArticle`, { "headers": {}, force: false, id: 1 })
  });

  test('it generates method to dispatch fetch records action', async () => {
    const component = mockComponent()
    await Napi.generateMethods(resources).fetchArticles.call(component)
    expect(component.$store.dispatch).toHaveBeenCalledWith(`${namespace}article/fetchArticles`, { "headers": {}, force: false })
  });

  test('it generates method to dispatch create action', async () => {
    const component = mockComponent()
    const record = {
      id: 1,
      name: 'name1'
    }
    await Napi.generateMethods(resources).createArticle.call(component, record)
    expect(component.$store.dispatch).toHaveBeenCalledWith(`${namespace}article/createArticle`, { "headers": {}, record })
  });

  test('it generates method to dispatch update action', async () => {
    const component = mockComponent()
    const record = {
      id: 1,
      name: 'name1'
    }
    await Napi.generateMethods(resources).updateArticle.call(component, record)
    expect(component.$store.dispatch).toHaveBeenCalledWith(`${namespace}article/updateArticle`, { "headers": {}, record })
  });

  test('it generates method to dispatch destroy action', async () => {
    const component = mockComponent()
    await Napi.generateMethods(resources).destroyArticle.call(component, 1)
    expect(component.$store.dispatch).toHaveBeenCalledWith(`${namespace}article/destroyArticle`, { "headers": {}, id: 1 })
  });
}

describe('generateMethods', () => {
  describe('without namespace', () => {
    sharedTest('')
  });

  describe('with namespace', () => {
    sharedTest('admin/')
  });
});
