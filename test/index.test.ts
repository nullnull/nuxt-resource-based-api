import Vapi from './../src/index'

test('works fine', () => {
  Vapi.setConfig({
    apiUrl: 'http://localhost:5000/'
  })
  const { state, mutations, actions } = Vapi.createStore(
    'article',
    ['index', 'show', 'new', 'edit', 'destroy']
  )
  console.log(state);
  console.log(mutations);
  console.log(actions);
});