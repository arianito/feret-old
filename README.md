# Feret

Feret is a minimal state management for React, it uses typescript Decorators to reduce redundant wirings in your application.

# Installation

```bash
npm install feret
```

# createStore and FeretProvider

Like any state management out there, you must have a store first :)

```javascript
const store = createStore();
root.render(
  <React.StrictMode>
    <FeretProvider store={store}>...</FeretProvider>
  </React.StrictMode>,
);
```

# @Service

Service is the main part of a Feret application, its a decorated class containing logic and data, it is exists to do a sole purpose in your application, whether it is to do something in background or to act upon a user request:

```javascript
@Service
class Todo {
  // todos have side-effect on UI
  @observable todos = [];

  // make sure everything is changed
  // with respect to immutability
  addTodo(newTodo) {
    this.todos = [...this.todos, newTodo];
  }

  async fetchTodos() {
    this.todos = await fetch('/api/todos');
  }
}
```

# @Annotated(name: string)

all services in feret get annotated by an auto generated incremental index, once you change the order of importing a services, your service indexes might change, in order to fix this issue, you can annotate your service with a unique name (this is mostly useful when using persisted variables or SSR)

```javascript
@Service
@Annotated('Todo :)')
class Todo {
  @observable @persisted todos = [];
  ...
```

# @Version(version: number)

consider a case you stored a persisted value on clients's storage, then you made a change in it's data structure, but because program has no understanding of stored data, this will make huge error in your code, so if you have changed a variable structure make sure you changed the version of it's parent service, this will cause a force re-generation of data on client side

use it wisely :)

```javascript
@Service
@Annotated('Todo :)')
@Version(1)
class Todo {
  @observable @persisted todos = [{todo: 'hello'}];

@Service
@Annotated('Todo :)')
@Version(2)
class Todo {
  @observable @persisted todos = [{name: 'hello'}];
  ...
```

# @observable

Some services have side-effects on UI, mark variables that may affect UI with this decorator:

```javascript
@Service
class Todo {
  @observable todos = [];
  ...
```

# @persisted

you can mark properties of a class as persisted, once they tagged, they can be simply combined together with getSnapshot() and restoreSnapshot()

```javascript
@Service
class Todo {
  @observable @persisted todos = [];
  ...
```

# getSnapshot(store: Store)

get a json containing all persisted fields on all services, services that are annotated with a name will use the name instead of the auto-generated id

# restoreSnapshot(store: Store, d: Json)

so you got your snapshot, this function will put it back, you can make your own implementation of persisting it, whether on server or client's localstorage, that's up to you

# browserPersist

simply hook to browser changes to perform your persisting, this will make sure your data will be saved on page focus changes

here is an example of persising in localstorage :)

```javascript
browserPersist(context, localStorage.getItem('saved_data'), (data) =>
  localStorage.setItem('saved_data', data),
);
```

# useObserver([ ... ])

This hook is a listener to all services, once a property that decorated with @observable changed, UI component will update too:

```javascript

const App: FC = () => {
  useObserver([Todo]);
  ...
```

# useService

To create a instance of a service:

```javascript
const TodoList: FC = () => {
  // listen to changes
  // in case Todo.todos changed
  useObserver([Todo]);
  const service = useService(Todo);

  // once Todo.todos changed
  // the component will render again
  // and this list too
  return (
    <ul>
      {service.todos.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  );
};
```

you can use useService independent from useObserver, you may have services that are pure logic and wont have side-effect on UI :)

# wire

What if you want to use a Service inside another? wire services to each other:

```javascript
@Service
class BackgroundTask {
  todo = wire(Todo);

  created() {
    setInterval(this.saveTodos, 10000);
  }

  async saveTodos() {
    await fetch('/api/update', this.todo.todos);
  }
}
```

# Invoking

You may want to call a function on all services at once and wait until they are done:

```javascript
const store = createStore();
store.orderedInvoke('created').then(() => {
  // after created called on all services
});
```

this is called ordered invoking, calls all created() methods on all service in order, ordering can be defined with @Order

```javascript
@Service @Order(-100)
class FirstService { ... }

@Service @Order(-50)
class SecondService { ... }

@Service @Order(200)
class MaybeLastService { ... }
```

or you can call all functions at once: (this is the same as Promise.all)

```javascript
const store = createStore();
store.invoke('created').then(() => {
  // after created called on all services
});
```
