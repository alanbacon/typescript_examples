examples: https://github.com/alanbacon/typescript_examples

## Intro

Thank for coming to this presentation on typescript. I guess the overarching goal here is to try and share some tips and tricks for removing the `any` types from our code base. The `any` type prevents intelliSense from helping us the developers know what methods and variables are available on our objects and can therefore be the source of many bugs.

## Outcomes

There are a few main outcomes I would like from the session:

- For everyone to understand how to use type predicates, this helps turn our `unknown` types in known ones.
- To see how the relatively new `satisfies` operator is used, and why its useful
- Everyone to have an appreciation of discriminated unions

## Type Predicates

- One of the main places `any` is left in the meta-backend code base is in the catching of errors, we could be using a mixture of `unknown` and type predicates to remove them.
  - Then we could turn on the stricter typescript checking to forbid implicit and explicit `any` from the code base.
- Using the `as` keyword can be pretty dangerous as you lose type-checking because you are telling the compiler you know better.
  - It's fine and even necessary in some cases (like when you are deserialising a JSON response)

## Satisfies

- Another good way to remove the `as` keyword form the code base.
- Its great for locking down objects to something you know can be serialisable.
- A type level `Satisifies` type can be created really easily.
- There are some other used cases for satisfies as well. But ill let you watch the video on that in your own time.

## Generics Foundations

I now want to talk about discriminated unions: But to make sure we're on the same page ill start with some foundations

- intro to type variables/parameters
- how to build more complex types using type variables
- the three ways to use the `extends` keyword
- the `in` keyword
- look ahead to discriminated unions

## Discriminated Unions

- more advanced but great when you want to write some generic code for types that are similar but varied
