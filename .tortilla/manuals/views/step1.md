# Step 1: Starting with the core - an HTML parser

[//]: # (head-end)


As I already mentioned, our AST will be consisted of 3 node types, which means that we will have to create an ENUM that will contain the values `element`, `props` and `value`. This way the node types won't be hardcoded and patching the code can be very easy:

[{]: <helper> (diffStep 1.1)

#### [Step 1.1: Define node types ENUM](https://github.com/DAB0mB/jsx-runtime/commit/d341d00)

##### Changed package.json
```diff
@@ -1,5 +1,6 @@
 ┊1┊1┊{
 ┊2┊2┊  "name": "jsx-runtime",
+┊ ┊3┊  "version": "0.1.0",
 ┊3┊4┊  "description": "A runtime version of JSX",
 ┊4┊5┊  "main": "build/jsx-runtime.js",
 ┊5┊6┊  "repository": {
```

##### Added src&#x2F;index.js
```diff
@@ -0,0 +1,5 @@
+┊ ┊1┊const types = {
+┊ ┊2┊  element: 'element',
+┊ ┊3┊  value: 'value',
+┊ ┊4┊  props: 'props',
+┊ ┊5┊}🚫↵
```

[}]: #

Since we had 3 node types, it means that for each of them we should have a dedicated parsing function:

[{]: <helper> (diffStep 1.2)

#### [Step 1.2: Define parse functions stubs](https://github.com/DAB0mB/jsx-runtime/commit/38b55a8)

##### Changed src&#x2F;index.js
```diff
@@ -2,4 +2,40 @@
 ┊ 2┊ 2┊  element: 'element',
 ┊ 3┊ 3┊  value: 'value',
 ┊ 4┊ 4┊  props: 'props',
-┊ 5┊  ┊}🚫↵
+┊  ┊ 5┊}
+┊  ┊ 6┊
+┊  ┊ 7┊const parseElement = (str) => {
+┊  ┊ 8┊  let match
+┊  ┊ 9┊  let length
+┊  ┊10┊
+┊  ┊11┊  const node = {
+┊  ┊12┊    type: types.element,
+┊  ┊13┊    props: parseProps(''),
+┊  ┊14┊    children: [],
+┊  ┊15┊    length: 0,
+┊  ┊16┊    name: '',
+┊  ┊17┊  }
+┊  ┊18┊
+┊  ┊19┊  return node
+┊  ┊20┊}
+┊  ┊21┊
+┊  ┊22┊const parseProps = (str) => {
+┊  ┊23┊  let match
+┊  ┊24┊  let length
+┊  ┊25┊
+┊  ┊26┊  const node = {
+┊  ┊27┊    type: types.props,
+┊  ┊28┊    length: 0,
+┊  ┊29┊    props: {},
+┊  ┊30┊  }
+┊  ┊31┊
+┊  ┊32┊  return node
+┊  ┊33┊}
+┊  ┊34┊
+┊  ┊35┊const parseValue = (str) => {
+┊  ┊36┊  return {
+┊  ┊37┊    type: types.value,
+┊  ┊38┊    length: str.length,
+┊  ┊39┊    value: str.trim(),
+┊  ┊40┊  }
+┊  ┊41┊}
```

[}]: #

Each function creates the basic node type and returns it. Note that at the begnning of the scope of each function I've defined a couple of variables:

- `let match` - which will be used to store regular expression matches on the fly.
- `let length` - which will be used to store the length of the match so we can trim the JSX code string right after and accumulate it in `node.length`.

For now the `parseValue()` function is pretty straight forward and just returns a node which wraps the given string.

We will begin with the implementation of the element node and we will branch out to other nodes as we go. First we will try to figure out the name of the element. If an element tag opener was not found, we will assume that the current part of the code is a value:

[{]: <helper> (diffStep 1.3)

#### [Step 1.3: Check if value node](https://github.com/DAB0mB/jsx-runtime/commit/c126fc7)

##### Changed src&#x2F;index.js
```diff
@@ -16,6 +16,19 @@
 ┊16┊16┊    name: '',
 ┊17┊17┊  }
 ┊18┊18┊
+┊  ┊19┊  match = str.match(/<(\w+)/)
+┊  ┊20┊
+┊  ┊21┊  if (!match) {
+┊  ┊22┊    str = str.split('<')[0]
+┊  ┊23┊
+┊  ┊24┊    return parseValue(str)
+┊  ┊25┊  }
+┊  ┊26┊
+┊  ┊27┊  node.name = match[1]
+┊  ┊28┊  length = match.index + match[0].length
+┊  ┊29┊  str = str.slice(length)
+┊  ┊30┊  node.length += length
+┊  ┊31┊
 ┊19┊32┊  return node
 ┊20┊33┊}
```

[}]: #

Up next, we need to parse the props. To make things more efficient, we will need to first find the tag closer so we can provide the `parseProps()` method the relevant part of the string:

[{]: <helper> (diffStep 1.4)

#### [Step 1.4: Parse props](https://github.com/DAB0mB/jsx-runtime/commit/763712e)

##### Changed src&#x2F;index.js
```diff
@@ -29,6 +29,15 @@
 ┊29┊29┊  str = str.slice(length)
 ┊30┊30┊  node.length += length
 ┊31┊31┊
+┊  ┊32┊  match = str.match(/>/)
+┊  ┊33┊
+┊  ┊34┊  if (!match) return node
+┊  ┊35┊
+┊  ┊36┊  node.props = parseProps(str.slice(0, match.index), values)
+┊  ┊37┊  length = node.props.length
+┊  ┊38┊  str = str.slice(length)
+┊  ┊39┊  node.length += length
+┊  ┊40┊
 ┊32┊41┊  return node
 ┊33┊42┊}
```

[}]: #

Now that we've plucked the right substring, we can go ahead and implement the `parseProps()` function logic:

[{]: <helper> (diffStep 1.5)

#### [Step 1.5: Implement props parsing logic](https://github.com/DAB0mB/jsx-runtime/commit/14ff2dd)

##### Changed src&#x2F;index.js
```diff
@@ -51,6 +51,27 @@
 ┊51┊51┊    props: {},
 ┊52┊52┊  }
 ┊53┊53┊
+┊  ┊54┊  const matchNextProp = () => {
+┊  ┊55┊    match =
+┊  ┊56┊      str.match(/ *\w+="(?:.*[^\\]")?/) ||
+┊  ┊57┊      str.match(/ *\w+/)
+┊  ┊58┊  }
+┊  ┊59┊
+┊  ┊60┊  matchNextProp()
+┊  ┊61┊
+┊  ┊62┊  while (match) {
+┊  ┊63┊    const propStr = match[0]
+┊  ┊64┊    let [key, ...value] = propStr.split('=')
+┊  ┊65┊    node.length += propStr.length
+┊  ┊66┊    key = key.trim()
+┊  ┊67┊    value = value.join('=')
+┊  ┊68┊    value = value ? value.slice(1, -1) : true
+┊  ┊69┊    node.props[key] = value
+┊  ┊70┊    str = str.slice(0, match.index) + str.slice(match.index + propStr.length)
+┊  ┊71┊
+┊  ┊72┊    matchNextProp()
+┊  ┊73┊  }
+┊  ┊74┊
 ┊54┊75┊  return node
 ┊55┊76┊}
```

[}]: #

The logic is pretty straight forward - we iterate through the string, and each time we try match the next key->value pair. Once a pair wasn't found, we return the node with the accumulated props. Note that providing only an attribute with no value is also a valid syntax which will set its value to `true` by default, thus the `/ *\w+/` regexp. Let's proceed where we left of with the element parsing implementation.

We need to figure out whether the current element is self closing or not. If it is, we will return the node, and otherwise we will continue to parsing its children:

[{]: <helper> (diffStep 1.6)

#### [Step 1.6: Parse element closure](https://github.com/DAB0mB/jsx-runtime/commit/4b49cea)

##### Changed src&#x2F;index.js
```diff
@@ -38,6 +38,22 @@
 ┊38┊38┊  str = str.slice(length)
 ┊39┊39┊  node.length += length
 ┊40┊40┊
+┊  ┊41┊  match = str.match(/^ *\/ *>/)
+┊  ┊42┊
+┊  ┊43┊  if (match) {
+┊  ┊44┊    node.length += match.index + match[0].length
+┊  ┊45┊
+┊  ┊46┊    return node
+┊  ┊47┊  }
+┊  ┊48┊
+┊  ┊49┊  match = str.match(/>/)
+┊  ┊50┊
+┊  ┊51┊  if (!match) return node
+┊  ┊52┊
+┊  ┊53┊  length = match.index + 1
+┊  ┊54┊  str = str.slice(length)
+┊  ┊55┊  node.length += length
+┊  ┊56┊
 ┊41┊57┊  return node
 ┊42┊58┊}
```

[}]: #

Accordingly, we're gonna implement the children parsing logic:

[{]: <helper> (diffStep 1.7)

#### [Step 1.7: Parse children](https://github.com/DAB0mB/jsx-runtime/commit/dad4502)

##### Changed src&#x2F;index.js
```diff
@@ -54,6 +54,16 @@
 ┊54┊54┊  str = str.slice(length)
 ┊55┊55┊  node.length += length
 ┊56┊56┊
+┊  ┊57┊  let child = parseElement(str)
+┊  ┊58┊
+┊  ┊59┊  while (child.type === types.element || child.value) {
+┊  ┊60┊    length = child.length
+┊  ┊61┊    str = str.slice(length)
+┊  ┊62┊    node.length += length
+┊  ┊63┊    node.children.push(child)
+┊  ┊64┊    child = parseElement(str)
+┊  ┊65┊  }
+┊  ┊66┊
 ┊57┊67┊  return node
 ┊58┊68┊}
```

[}]: #

Children parsing is recursive. We keep calling the `parseElement()` method for the current substring until there's no more match. Once we've gone through all the children, we can finish the process by finding the closing tag:

[{]: <helper> (diffStep 1.8)

#### [Step 1.8: Parse closing tag](https://github.com/DAB0mB/jsx-runtime/commit/b9013d6)

##### Changed src&#x2F;index.js
```diff
@@ -64,6 +64,12 @@
 ┊64┊64┊    child = parseElement(str)
 ┊65┊65┊  }
 ┊66┊66┊
+┊  ┊67┊  match = str.match(new RegExp(`</${node.name}>`))
+┊  ┊68┊
+┊  ┊69┊  if (!match) return node
+┊  ┊70┊
+┊  ┊71┊  node.length += match.index + match[0].length
+┊  ┊72┊
 ┊67┊73┊  return node
 ┊68┊74┊}
```

[}]: #

The HTML parsing part is finished! Now we can call the `parseElement()` for any given HTML string and we should get a JSON output which represents an AST, like the following:

```json
{
  "type": "element",
  "props": {
    "type": "props",
    "length": 20,
    "props": {
      "onclick": "onclick()"
    }
  },
  "children": [
    {
      "type": "element",
      "props": {
        "type": "props",
        "length": 15,
        "props": {
          "src": "icon.svg"
        }
      },
      "children": [],
      "length": 18,
      "name": "img"
    },
    {
      "type": "element",
      "props": {
        "type": "props",
        "length": 0,
        "props": {}
      },
      "children": [
        {
          "type": "value",
          "length": 4,
          "value": "text"
        }
      ],
      "length": 12,
      "name": "span"
    }
  ],
  "length": 74,
  "name": "div"
}
```


[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Intro](https://github.com/DAB0mB/jsx-runtime/tree/master@0.1.0/README.md) | [Next Step >](https://github.com/DAB0mB/jsx-runtime/tree/master@0.1.0/.tortilla/manuals/views/step2.md) |
|:--------------------------------|--------------------------------:|

[}]: #
