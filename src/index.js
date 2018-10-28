const types = {
  element: 'element',
  value: 'value',
  props: 'props',
}

const parseElement = (str) => {
  let match
  let length

  const node = {
    type: types.element,
    props: parseProps(''),
    children: [],
    length: 0,
    name: '',
  }

  return node
}

const parseProps = (str) => {
  let match
  let length

  const node = {
    type: types.props,
    length: 0,
    props: {},
  }

  return node
}

const parseValue = (str) => {
  return {
    type: types.value,
    length: str.length,
    value: str.trim(),
  }
}
