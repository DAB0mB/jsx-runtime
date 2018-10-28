# Step 3: The grand finale - execution

[//]: # (head-end)


At this point we should have a function which can transform a JSX code into an AST, including string interpolation. The only thing which is left to do now is build a function which will recursively create React elements out of the nodes in the tree.

The main function of the module should be called with a template tag. If you went through the previous step, you should know that a consistent string has an advantage over an array of splits of strings, since we can unleash the full potential of a regexp with ease. Accordingly, we will take all the given splits and join them with the `placeholder` constant.

```
['<', '> Hello ', '</', '>'] -> '<__jsxPlaceholder>Hello __jsxPlaceholder</__jsxPlaceholder>'
```

Once we join the string we can create React elements recursively:

[{]: <helper> (diffStep 3.1)

#### [Step 3.1: Create React elements out of nodes](https://github.com/DAB0mB/jsx-runtime/commit/56cb516)

##### Changed src&#x2F;index.js
```diff
@@ -1,3 +1,5 @@
+┊ ┊1┊import React from 'react'
+┊ ┊2┊
 ┊1┊3┊const placeholder = `__jsxPlaceholder${Date.now()}`
 ┊2┊4┊
 ┊3┊5┊const types = {
```
```diff
@@ -6,6 +8,24 @@
 ┊ 6┊ 8┊  props: 'props',
 ┊ 7┊ 9┊}
 ┊ 8┊10┊
+┊  ┊11┊export const jsx = (splits, ...values) => {
+┊  ┊12┊  const root = parseElement(splits.join(placeholder), values)
+┊  ┊13┊
+┊  ┊14┊  return createReactElement(root)
+┊  ┊15┊}
+┊  ┊16┊
+┊  ┊17┊const createReactElement = (node) => {
+┊  ┊18┊  if (node.type === types.value) {
+┊  ┊19┊    return node.value
+┊  ┊20┊  }
+┊  ┊21┊
+┊  ┊22┊  return React.createElement(
+┊  ┊23┊    node.tag,
+┊  ┊24┊    node.props.props,
+┊  ┊25┊    ...node.children.map(createReactElement),
+┊  ┊26┊  )
+┊  ┊27┊}
+┊  ┊28┊
 ┊ 9┊29┊const parseElement = (str, values) => {
 ┊10┊30┊  let match
 ┊11┊31┊  let length
```
```diff
@@ -168,3 +188,5 @@
 ┊168┊188┊
 ┊169┊189┊  return nodes
 ┊170┊190┊}
+┊   ┊191┊
+┊   ┊192┊export default jsx
```

[}]: #

Note that if a node of value type is being iterated, we will just return the raw string, otherwise we will try to address its `node.children` property which doesn't exist.

---

Our JSX runtime is now ready to use. You can view the source code at the official [Github repository](https://github.com/DAB0mB/jsx-runtime) or you can download using NPM and require via Node.JS:

    $ npm install jsx-runtime


[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Previous Step](https://github.com/DAB0mB/jsx-runtime/tree/master@0.1.0/.tortilla/manuals/views/step2.md) |
|:----------------------|

[}]: #
