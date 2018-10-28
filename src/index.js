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

  match = str.match(/<(\w+)/)

  if (!match) {
    str = str.split('<')[0]

    return parseValue(str)
  }

  node.name = match[1]
  length = match.index + match[0].length
  str = str.slice(length)
  node.length += length

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
