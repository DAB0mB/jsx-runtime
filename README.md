# Jsx Runtime

[//]: # (head-end)


# Implementing a runtime version of JSX

## And learning how to think like a JSX parser

JSX is one of the most commonly used syntax extensions out there. Originally JSX was parsed via a [Facebook fork of Esprima](https://github.com/facebookarchive/esprima) - a JavaScript syntax parser developed by jQuery. As it gained momentum, [Acorn](https://github.com/acornjs/acorn) took things to their hands and decided to make their own version of the parser which ended up being 1.5–2x faster than Esprima-fb, and is now being used by Babel.

It definitely went through an evolution, but regardless of its phase, all parsers had a similar output - which is an AST. Once we have an AST representation of the JSX code, interpretation is extremely easy.

Today we're  gonna understand how a JSX parser thinks by implementing one of our own. Unlike Babel, rather than compiling, we're gonna evaluate the nodes in the AST according to their types, which means that we will be able to use JSX during runtime.
Below is an example of the final product:

```js
class Hello extends React.Component {
  render() {
    return jsx `<div>Hello ${this.props.name}</div>`
  }
}

ReactDOM.render(
  jsx `<${Hello} name="World" />`,
  document.getElementById('container')
)
```

Before we go ahead and rush to implementing the parser let's understand what we're aiming for. JSX simply takes an HTML-like syntax and transforms it into nested `React.createElement()` calls. What makes JSX unique is that we can use string interpolation within our HTML templates, so we can provide it with data which doesn't necessarily has to be serialized, things like functions, arrays, or objects.
So given the following code:

```js
const el = (props) => (
  <div onClick={props.onClick}>
    <Icon src={props.icon} /><span>{props.text}</span>
  </div>
)
```

We should get the following output once compiling it with Babel:

```js
const el = (props) => (
  React.createElement(
    "div",
    { onClick: props.onClick },
    React.createElement(Icon, { src: props.icon }),
    React.createElement(
      "span",
      null,
      props.text
    )
  )
)
```

Just aquick reminder - the compiled result should be used internally by ReactDOM to differentiate changes in the virtual DOM and then render them. This is something which is React specific and has nothing to do with JSX, so at this point we have achieved our goal.

Essentially there are 3 things we should figure out when parsing a JSX code:

- The name / component of the React element.
- The props of the React element.
- The children of the React element, for each this process should repeat itself recursively.

As I mentioned earlier, it would be best if we could break down the code into nodes first and represent it as an AST. Looking at the input of the example above, we can roughly visualize how we would pluck the nodes from the code:

![Analyzing the JSX code.](https://cdn-images-1.medium.com/max/1600/1*AqTHDuxX5NNCI3iLycVfxA.png)

And to put things simple, here's a schematic representation of the analysis above:

![A schematic representation of the analysis.](https://cdn-images-1.medium.com/max/1600/1*i8h2MocLHni8mTuPaakwBQ.png)

Accordingly, we're gonna have 3 types of nodes:

- Element node.
- Props node.
- Value node.

Let's decide that each node has a base schema with the following properties:

- node.type - which will represent the type name of the node, e.g. `element`, `props` and `value`. Based on the node type we can also determine that additional properties that the node's gonna carry. In our parser, each node type should have the following additional properties:

![node type schemas](https://cdn-images-1.medium.com/max/1600/1*dgAy6Zbj6ttfNqgppWIjug.png)

- node.length -which represents the length of the sub-string in the code that the node occupies. This will help us trim the code string as we go with the parsing process so we can always focus on relevant parts of the string for the current node:

![Any time we parse a small part of the string, we slice the part we've just parsed.](https://cdn-images-1.medium.com/max/1600/1*PeiZnuBTKfLlDiaL24dgHw.png)

In the function that we're gonna build we'll be taking advantage of ES6's tagged templates. Tagged templates are string literals which can be processed by a custom handler according to our needs (see [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates)).

So essentially the signature of our function should look like this:

```js
const jsx = (splits, ...values) => {
  // ...
}
```

Since we're gonna heavily rely on regular expression, it will be much easier to deal with a consistent string, so we can unleash the regexp full potential. For now let's focus on the string part without the literal, and parse regular HTML string. Once we have that logic, we can implement string interpolation handling on top of it.


[//]: # (foot-start)

[{]: <helper> (navStep)

| [Begin Tutorial >](.tortilla/manuals/views/step1.md) |
|----------------------:|

[}]: #
