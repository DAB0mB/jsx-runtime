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

  match = str.match(/>/)

  if (!match) return node

  node.props = parseProps(str.slice(0, match.index), values)
  length = node.props.length
  str = str.slice(length)
  node.length += length

  match = str.match(/^ *\/ *>/)

  if (match) {
    node.length += match.index + match[0].length

    return node
  }

  match = str.match(/>/)

  if (!match) return node

  length = match.index + 1
  str = str.slice(length)
  node.length += length

  let child = parseElement(str)

  while (child.type === types.element || child.value) {
    length = child.length
    str = str.slice(length)
    node.length += length
    node.children.push(child)
    child = parseElement(str)
  }

  match = str.match(new RegExp(`</${node.name}>`))

  if (!match) return node

  node.length += match.index + match[0].length

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

  const matchNextProp = () => {
    match =
      str.match(/ *\w+="(?:.*[^\\]")?/) ||
      str.match(/ *\w+/)
  }

  matchNextProp()

  while (match) {
    const propStr = match[0]
    let [key, ...value] = propStr.split('=')
    node.length += propStr.length
    key = key.trim()
    value = value.join('=')
    value = value ? value.slice(1, -1) : true
    node.props[key] = value
    str = str.slice(0, match.index) + str.slice(match.index + propStr.length)

    matchNextProp()
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
