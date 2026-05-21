---
title: "@ddd-ts/types"
description: Tiny shared utility types used by the rest of the toolchain.
---

`@ddd-ts/types` is the smallest package in the monorepo. It only exports two
type aliases, used everywhere else in the toolchain.

```ts
import type { Constructor, AbstractConstructor } from "@ddd-ts/types";
```

## `Constructor<T, P>`

The type of any class that constructs a `T` from a parameters tuple `P`.

```ts
export type Constructor<T = any, P extends any[] = any[]> = new (
  ...args: P
) => T;
```

Useful whenever you need to take a class as an argument:

```ts
function instantiate<C extends Constructor>(ctor: C): InstanceType<C> {
  return new ctor();
}
```

## `AbstractConstructor<T, P>`

The same, but for `abstract` classes — they cannot be instantiated, so they
have a different signature in TypeScript.

```ts
export type AbstractConstructor<T = any, P extends any[] = any[]> = abstract new (
  ...args: P
) => T;
```

Used by the trait system to accept any base class — abstract or concrete — as
the foundation for a trait factory.

## Why these are extracted

`@ddd-ts/traits`, `@ddd-ts/core` and the makers all manipulate constructors.
Keeping the types in their own zero-dependency package means downstream
consumers get a single canonical name for "class constructor" instead of two
slightly different copies.
