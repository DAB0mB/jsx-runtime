# Step 2: Leveling up - string interpolation

[//]: # (head-end)


Now we're gonna add string interpolation on top of the HTML string parsing logic. Since we still wanna use the power of regexp at its full potential, we're gonna assume that the given string would be a template with placeholders, where each of them should be replaced with a value. That would be the easiest and most efficient way, rather than accepting an array of string splits.

```json
[
  "<__jsxPlaceholder>Hello __jsxPlaceholder</__jsxPlaceholder>",
  [MyComponent, "World", MyComponent]
]
```

Accordingly, we will update the parsing functions' signature and their calls, and we will define a placeholder constant:

[{]: <helper> (diffStep 2.1)

#### [Step 2.1: Initialize placeholder and update parsers signatures](https://github.com/DAB0mB/jsx-runtime/commit/733392d)

##### Changed src&#x2F;index.js
```diff
@@ -1,16 +1,18 @@
+┊  ┊ 1┊const placeholder = `__jsxPlaceholder${Date.now()}`
+┊  ┊ 2┊
 ┊ 1┊ 3┊const types = {
 ┊ 2┊ 4┊  element: 'element',
 ┊ 3┊ 5┊  value: 'value',
 ┊ 4┊ 6┊  props: 'props',
 ┊ 5┊ 7┊}
 ┊ 6┊ 8┊
-┊ 7┊  ┊const parseElement = (str) => {
+┊  ┊ 9┊const parseElement = (str, values) => {
 ┊ 8┊10┊  let match
 ┊ 9┊11┊  let length
 ┊10┊12┊
 ┊11┊13┊  const node = {
 ┊12┊14┊    type: types.element,
-┊13┊  ┊    props: parseProps(''),
+┊  ┊15┊    props: parseProps('', []),
 ┊14┊16┊    children: [],
 ┊15┊17┊    length: 0,
 ┊16┊18┊    name: '',
```
```diff
@@ -21,7 +23,7 @@
 ┊21┊23┊  if (!match) {
 ┊22┊24┊    str = str.split('<')[0]
 ┊23┊25┊
-┊24┊  ┊    return parseValue(str)
+┊  ┊26┊    return parseValue(str, values)
 ┊25┊27┊  }
 ┊26┊28┊
 ┊27┊29┊  node.name = match[1]
```
```diff
@@ -54,14 +56,14 @@
 ┊54┊56┊  str = str.slice(length)
 ┊55┊57┊  node.length += length
 ┊56┊58┊
-┊57┊  ┊  let child = parseElement(str)
+┊  ┊59┊  let child = parseElement(str, values)
 ┊58┊60┊
 ┊59┊61┊  while (child.type === types.element || child.value) {
 ┊60┊62┊    length = child.length
 ┊61┊63┊    str = str.slice(length)
 ┊62┊64┊    node.length += length
 ┊63┊65┊    node.children.push(child)
-┊64┊  ┊    child = parseElement(str)
+┊  ┊66┊    child = parseElement(str, values)
 ┊65┊67┊  }
 ┊66┊68┊
 ┊67┊69┊  match = str.match(new RegExp(`</${node.name}>`))
```
```diff
@@ -73,7 +75,7 @@
 ┊73┊75┊  return node
 ┊74┊76┊}
 ┊75┊77┊
-┊76┊  ┊const parseProps = (str) => {
+┊  ┊78┊const parseProps = (str, values) => {
 ┊77┊79┊  let match
 ┊78┊80┊  let length
 ┊79┊81┊
```
```diff
@@ -107,7 +109,7 @@
 ┊107┊109┊  return node
 ┊108┊110┊}
 ┊109┊111┊
-┊110┊   ┊const parseValue = (str) => {
+┊   ┊112┊const parseValue = (str, values) => {
 ┊111┊113┊  return {
 ┊112┊114┊    type: types.value,
 ┊113┊115┊    length: str.length,
```

[}]: #

Note how I used the `Date.now()` function to define a postfix for the placeholder. This we can be sure that the same value won't be given by the user as a string (possible, very unlikely). Now we will go through each parsing function and we'll make sure that it knows how to deal with placeholders correctly. We will start with the `parseElement()` function.

We will add an additional property to the node called: `node.tag`. The tag property is the component that will be used to create the React element. It can either be a string or a React.Component. If `node.name` is a placeholder, we will be taking the next value in the given values stack:

[{]: <helper> (diffStep 2.2)

#### [Step 2.2: Handle placeholder when parsing element](https://github.com/DAB0mB/jsx-runtime/commit/800bac3)

##### Changed src&#x2F;index.js
```diff
@@ -27,6 +27,7 @@
 ┊27┊27┊  }
 ┊28┊28┊
 ┊29┊29┊  node.name = match[1]
+┊  ┊30┊  node.tag = node.name === placeholder ? values.shift() : node.name
 ┊30┊31┊  length = match.index + match[0].length
 ┊31┊32┊  str = str.slice(length)
 ┊32┊33┊  node.length += length
```
```diff
@@ -72,6 +73,12 @@
 ┊72┊73┊
 ┊73┊74┊  node.length += match.index + match[0].length
 ┊74┊75┊
+┊  ┊76┊  if (node.name === placeholder) {
+┊  ┊77┊    const value = values.shift()
+┊  ┊78┊
+┊  ┊79┊    if (value !== node.tag) return node
+┊  ┊80┊  }
+┊  ┊81┊
 ┊75┊82┊  return node
 ┊76┊83┊}
```

[}]: #

We also made sure that the closing tag matches the opening tag. I've decided to "swallow" errors rather than throwing them for the sake of simplicity, but generally speaking it would make a lot of sense to implement error throws within the parsing functions.

Up next would be the props node. This is fairly simple, we're only gonna add an additional regexp to the array of matchers, and that regexp will check for placeholders. If a placeholder was detected, we're gonna replace it with the next value in the values stack:

[{]: <helper> (diffStep 2.3)

#### [Step 2.3: Handle placeholder when parsing props](https://github.com/DAB0mB/jsx-runtime/commit/8a4887e)

##### Changed src&#x2F;index.js
```diff
@@ -95,6 +95,7 @@
 ┊ 95┊ 95┊  const matchNextProp = () => {
 ┊ 96┊ 96┊    match =
 ┊ 97┊ 97┊      str.match(/ *\w+="(?:.*[^\\]")?/) ||
+┊   ┊ 98┊      str.match(new RegExp(` *\\w+=${placeholder}`)) ||
 ┊ 98┊ 99┊      str.match(/ *\w+/)
 ┊ 99┊100┊  }
 ┊100┊101┊
```
```diff
@@ -106,7 +107,9 @@
 ┊106┊107┊    node.length += propStr.length
 ┊107┊108┊    key = key.trim()
 ┊108┊109┊    value = value.join('=')
-┊109┊   ┊    value = value ? value.slice(1, -1) : true
+┊   ┊110┊    value =
+┊   ┊111┊      value === placeholder ? values.shift() :
+┊   ┊112┊      value ? value.slice(1, -1) : true
 ┊110┊113┊    node.props[key] = value
 ┊111┊114┊    str = str.slice(0, match.index) + str.slice(match.index + propStr.length)
```

[}]: #

Last but not least, would be the value node. This is the most complex to handle out of the 3 nodes, since it requires us to split the input string and create a dedicated value node out of each split. So now, instead of returning a single node value, we will return an array of them. Accordingly, we will also be changing the name of the function from `parseValue()` to `parseValues()`:

[{]: <helper> (diffStep 2.4)

#### [Step 2.4: Handle placeholder when parsing value](https://github.com/DAB0mB/jsx-runtime/commit/9afcbee)

##### Changed src&#x2F;index.js
```diff
@@ -23,7 +23,7 @@
 ┊23┊23┊  if (!match) {
 ┊24┊24┊    str = str.split('<')[0]
 ┊25┊25┊
-┊26┊  ┊    return parseValue(str, values)
+┊  ┊26┊    return parseValues(str, values)
 ┊27┊27┊  }
 ┊28┊28┊
 ┊29┊29┊  node.name = match[1]
```
```diff
@@ -57,14 +57,26 @@
 ┊57┊57┊  str = str.slice(length)
 ┊58┊58┊  node.length += length
 ┊59┊59┊
-┊60┊  ┊  let child = parseElement(str, values)
+┊  ┊60┊  let children = []
 ┊61┊61┊
-┊62┊  ┊  while (child.type === types.element || child.value) {
-┊63┊  ┊    length = child.length
-┊64┊  ┊    str = str.slice(length)
-┊65┊  ┊    node.length += length
-┊66┊  ┊    node.children.push(child)
-┊67┊  ┊    child = parseElement(str, values)
+┊  ┊62┊  const parseNextChildren = () => {
+┊  ┊63┊    children = [].concat(parseElement(str, values))
+┊  ┊64┊  }
+┊  ┊65┊
+┊  ┊66┊  parseNextChildren()
+┊  ┊67┊
+┊  ┊68┊  while (children.length) {
+┊  ┊69┊    children.forEach((child) => {
+┊  ┊70┊      length = child.length
+┊  ┊71┊      str = str.slice(length)
+┊  ┊72┊      node.length += length
+┊  ┊73┊
+┊  ┊74┊      if (child.type !== types.value || child.value) {
+┊  ┊75┊        node.children.push(child)
+┊  ┊76┊      }
+┊  ┊77┊    })
+┊  ┊78┊
+┊  ┊79┊    parseNextChildren()
 ┊68┊80┊  }
 ┊69┊81┊
 ┊70┊82┊  match = str.match(new RegExp(`</${node.name}>`))
```
```diff
@@ -119,10 +131,40 @@
 ┊119┊131┊  return node
 ┊120┊132┊}
 ┊121┊133┊
-┊122┊   ┊const parseValue = (str, values) => {
-┊123┊   ┊  return {
-┊124┊   ┊    type: types.value,
-┊125┊   ┊    length: str.length,
-┊126┊   ┊    value: str.trim(),
-┊127┊   ┊  }
+┊   ┊134┊const parseValues = (str, values) => {
+┊   ┊135┊  const nodes = []
+┊   ┊136┊
+┊   ┊137┊  str.split(placeholder).forEach((split, index, splits) => {
+┊   ┊138┊    let value
+┊   ┊139┊    let length
+┊   ┊140┊
+┊   ┊141┊    value = split
+┊   ┊142┊    length = split.length
+┊   ┊143┊    str = str.slice(length)
+┊   ┊144┊
+┊   ┊145┊    if (length) {
+┊   ┊146┊      nodes.push({
+┊   ┊147┊        type: types.value,
+┊   ┊148┊        length,
+┊   ┊149┊        value,
+┊   ┊150┊      })
+┊   ┊151┊    }
+┊   ┊152┊
+┊   ┊153┊    if (index === splits.length - 1) return
+┊   ┊154┊
+┊   ┊155┊    value = values.pop()
+┊   ┊156┊    length = placeholder.length
+┊   ┊157┊
+┊   ┊158┊    if (typeof value === 'string') {
+┊   ┊159┊      value = value.trim()
+┊   ┊160┊    }
+┊   ┊161┊
+┊   ┊162┊    nodes.push({
+┊   ┊163┊      type: types.value,
+┊   ┊164┊      length,
+┊   ┊165┊      value,
+┊   ┊166┊    })
+┊   ┊167┊  })
+┊   ┊168┊
+┊   ┊169┊  return nodes
 ┊128┊170┊}
```

[}]: #

The reason why I've decided to return an array of nodes and not a singe node which contains an array of values, just like the props node, is because it matches the signature of `React.createElement()` perfectly. The values will be passed as children with a spread operator (`...`), and you should see further this tutorial how this well it fits.

Note that we've also changed the way we accumulate children in the `parseElement()` function. Since `parseValues()` returns an array now, and not a single node, we flatten it using an empty array concatenation (`[].concat()`), and we only push the children whose contents are not empty.


[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Previous Step](https://github.com/DAB0mB/jsx-runtime/tree/master@0.1.0/.tortilla/manuals/views/step1.md) | [Next Step >](https://github.com/DAB0mB/jsx-runtime/tree/master@0.1.0/.tortilla/manuals/views/step3.md) |
|:--------------------------------|--------------------------------:|

[}]: #
