import Napi from './../../src/index'
import { Resource } from '../../dist';

const ARTICLE_STATE = 'ARTICLE_STATE'
const ARTICLES_STATE = 'ARTICLES_STATE'
const INITIALIZING_ARTICLE_STATE = 'INITIALIZING_ARTICLE_STATE'
const EDITING_ARTICLE_STATE = 'EDITING_ARTICLE_STATE'

const ADMIN_ARTICLE_STATE = 'ADMIN_ARTICLE_STATE'
const ADMIN_ARTICLES_STATE = 'ADMIN_ARTICLES_STATE'
const ADMIN_INITIALIZING_ARTICLE_STATE = 'ADMIN_INITIALIZING_ARTICLE_STATE'
const ADMIN_EDITING_ARTICLE_STATE = 'ADMIN_EDITING_ARTICLE_STATE'

const mockComponent = () => {
  return {
    $store: {
      state: {
        article: {
          article: ARTICLE_STATE,
          articles: ARTICLES_STATE,
          initializingArticle: INITIALIZING_ARTICLE_STATE,
          editingArticle: EDITING_ARTICLE_STATE
        },
        admin: {
          article: {
            article: ADMIN_ARTICLE_STATE,
            articles: ADMIN_ARTICLES_STATE,
            initializingArticle: ADMIN_INITIALIZING_ARTICLE_STATE,
            editingArticle: ADMIN_EDITING_ARTICLE_STATE
          }
        }
      }
    },
  }
}

describe('generateMethods', () => {
  describe('without namespace', () => {
    const resources = [
      { resource: `article`, action: 'index' },
      { resource: `article`, action: 'show' },
      { resource: `article`, action: 'new' },
      { resource: `article`, action: 'edit' },
      { resource: `article`, action: 'destroy' },
    ] as Resource[]

    test('it generates computed properties', async () => {
      const computed = Napi.generateComputed(resources)
      expect(computed.article.call(mockComponent(), 1)).toEqual(ARTICLE_STATE)
      expect(computed.articles.call(mockComponent(), 1)).toEqual(ARTICLES_STATE)
      expect(computed.initializingArticle.call(mockComponent(), 1)).toEqual(INITIALIZING_ARTICLE_STATE)
      expect(computed.editingArticle.call(mockComponent(), 1)).toEqual(EDITING_ARTICLE_STATE)
    });
  });

  describe('with namespace', () => {
    const resources = [
      { resource: `admin/article`, action: 'index' },
      { resource: `admin/article`, action: 'show' },
      { resource: `admin/article`, action: 'new' },
      { resource: `admin/article`, action: 'edit' },
      { resource: `admin/article`, action: 'destroy' },
    ] as Resource[]

    test('it generates computed properties with namespace', async () => {
      const computed = Napi.generateComputed(resources)
      expect(computed.article.call(mockComponent(), 1)).toEqual(ADMIN_ARTICLE_STATE)
      expect(computed.articles.call(mockComponent(), 1)).toEqual(ADMIN_ARTICLES_STATE)
      expect(computed.initializingArticle.call(mockComponent(), 1)).toEqual(ADMIN_INITIALIZING_ARTICLE_STATE)
      expect(computed.editingArticle.call(mockComponent(), 1)).toEqual(ADMIN_EDITING_ARTICLE_STATE)
    });
  });

  // describe('with namespace', () => {
  //   sharedTest('admin/')
  // });
});
