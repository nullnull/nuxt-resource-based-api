import Napi from './../src/index'

test('works fine', () => {
  Napi.setConfig({
    apiUrl: 'http://localhost:5000/'
  })
  const { state, mutations, actions } = Napi.createStore(
    'article',
    ['index', 'show', 'new', 'edit', 'destroy']
  )
  console.log(state);
  console.log(mutations);
  console.log(actions);
});