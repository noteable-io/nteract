# myths (currently: @nteract/myths, TBC)

**This is a pre-alpha level package; interfaces are not stable yet!**

The `myths` framework allows for integrating sets of closely related actions, reducers and epics. Myths allow
close relationships where DRY and dependencies are minimized. Therefore, Myths provide for a structured way
to avoid boilerplate.

Myths build on top of the [Redux](https://react-redux.js.org/) and
[RxJS](https://redux.js.org/) libraries that are used elsewhere in the nteract core SDK.
As a refresher, Redux helps you maintain application state. In Redux, actions and reducers provide
predictable state management. The state may only be changed by dispatching an action to a reducer.
In [Redux-Observable](https://redux-observable.js.org/), an epic
is a function that takes in a stream of actions and returns
a stream of actions.

## Installation

```
$ yarn add myths
```

```
$ npm install --save myths
```

## Usage

### MythicPackage

First, create a `MythicPackage` with a name, a type for its private state, and the initial state.
As an example, the following creates a `MythicPackage` named `"iCanAdd"` which uses the `number`
type for its private state `sum` and an initial state of `sum` as `0`:

```typescript
export const iCanAdd = createMythicPackage("iCanAdd")<
  {
    sum: number;
  }
>({
  initialState: {
    sum: 0,
  },
});
```

### Myth

Next, you can the use the `MythicPackage` to create a `Myth` with a name, a type for its payload, and optionally a reducer
operating on its package's private state. In this example, the `MythicPackage` named `iCanAdd` creates a `Myth`
named `"addToSum"`:

```typescript
export const addToSum =
  iCanAdd.createMyth("addToSum")<number>({
    reduce: (state, action) =>
      state.set("sum", state.get("sum") + action.payload),
  });
```

A package can have any number of myths.

### Action

To create an action based on a myth, use its `create` function. You can then dispatch this action normally:

```typescript
store.dispatch(addToSum.create(8));
```

### Store

You get a store from a set of mythic packages, which has all the appropriate reducers and epics already in place:

```typescript
type NonPrivateState = { foo: string };
const configureStore = makeConfigureStore<NonPrivateState>()({
  packages: [
    iCanAdd,
  ],
});
export const store = configureStore({ foo: "bar" });
```

## Epics: their definition

Epics can be defined using two different shorthand methods:

```typescript
export const addToSum =
  iCanAdd.createMyth("addToSum")<number>({

    reduce: (state, action) =>
      state.set("sum", state.get("sum") + action.payload),

    thenDispatch: [
      (action, state) =>
        state.get("sum") - action.payload < 100 && 100 <= state.get("sum")
          ? of(sendNotification.create({message: "Just passed 100!"}))
          : EMPTY,
    ],

    andAlso: [
      {
        // Halve the sum every time an error action happens
        when: action => action.error ?? false,
        dispatch: (action, state, addToSum_) =>
          of(addToSum_.create(-state.get("sum") / 2)),
      },
    ],

  });
```

The first method uses `thenDispatch: []` to define actions which should be dispatched when actions of the defined type
are dispatched, and the second method uses `andAlso: []` to generate actions based on a custom predicate.
Since the type being defined is not available for reference yet, it is passed as third argument to the dispatch function.
 
## Testing

To test the actions of a mythic package, you can use the `testMarbles(...)` method. Note that this only tests the epics,
without evaluating reducers.

## Support

If you experience an issue while using this package or have a feature request, please file an issue on
the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:myths` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
