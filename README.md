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
    <FeretProvider store={store}>
      ...
    </FeretProvider>
  </React.StrictMode>
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
    this.todos = [
      ...this.todos,
      newTodo,
    ]
  }

  async fetchTodos() {
    this.todos = await fetch('/api/todos')
  }
}
```

# @observable
Some services have side-effects on UI, mark variables that may affect UI with this decorator:
```javascript
@Service
class Todo {
  @observable todos = [];
  ...
```

# useObserver
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
  return <ul>
    {service.todos.map(todo => (
      <li key={todo.id}>
        {todo.name}
      </li>
    ))}
  </ul>;
}
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
store.orderedInvoke("created").then(() => {
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
store.invoke("created").then(() => {
  // after created called on all services
});
```


# Example Project

Try cloning the starter project:
```bash
git clone https://github.com/xeuus/feret-starter
```