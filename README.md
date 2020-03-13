# ovm-compiler

[![Build Status](https://travis-ci.org/cryptoeconomicslab/ovm-compiler.svg?branch=master)](https://travis-ci.org/cryptoeconomicslab/ovm-compiler)

## Usage

```
npm i @cryptoeconomicslab/ovm-compiler
```

```js
const { Parser, SolidityCodeGenerator, Transpiler } = require('ovm-compiler')

const parser = new Parser()
const generator = new SolidityCodeGenerator()
const compiledPredicates = Transpiler.calculateInteractiveNodes(
  parser.parse(
    'def ownership(owner) := with Tx(su) as tx { SignedBy(tx, owner) }' +
      'def SignedBy(message, owner) := with Bytes() as signature {IsValidSignature(message, owner, signature)}'
  )
)
const result = generator.generate(compiledPredicates)
console.log(result)
```

## Online Demo

https://ovm-compiler.netlify.com

## Test

```
npm test
```

## Developers

### ovm-transpiler

This section describes 3 steps in OVM transpiler.

1. Static link

The transpiler links static library. Libraries should be defined by `@library` annotation.

```
@library
def StaticLibraryPredicate(a) := ...

def MainPredicate(a, b) := StaticLibraryPredicate(a) and ...
```

2. Quantifier elimination

Quantifiers should be defined by `@quantifier` annotation.

```
@library
@quantifier("hint data")
def StaticLibraryQuantifier(v, b) := ...

def MainPredicate(a, b) := StaticLibraryPredicate(b).any(v -> ...)
```

The transpiler transform a proposition to the proposition whose quantifiers are eliminated.
THe elimination rule table is this.

| original proposition    | eliminated                                  |
| ----------------------- | ------------------------------------------- |
| ∀b∈Quantifier(a):Foo(b) | ∀b∈Bytes(a):Not(Quantifier(b, a)) or Foo(b) |
| ∃b∈Quantifier(a):Foo(b) | ∃b∈Bytes(a):Quantifier(b, a) and Foo(b)     |

3. Compilation

In this process, the transpiler subdivides a proposition to propositions.
Show example.

Original

```
def MainPredicate(b) :=
StaticLibraryPredicate(b).any(v -> Foo(v) and Bar(v))
```

Compiled

```
def MainPredicateT(b) :=
StaticLibraryPredicateT(b).any(v -> MainPredicateTA(v))

def MainPredicateTA(b) :=
Foo(v) and Bar(v)

```

## Roadmap

- [x] Plasma checkpoint example
- [x] Plasma exit example
- [x] Plasma ownership predicate example
- [x] Plasma swap predicate example
- [x] Plasma offline swap predicate example
- [ ] Plasma fast finality predicate example
- [ ] Plasma swap between main chain and Plasma chain predicate example
- [ ] State channel example
- [ ] Optimistic Rollup example
- [x] add parser
- [x] add byte code generator for ethereum
- [ ] add code generator for Substrate
- [ ] update language to write state transition
