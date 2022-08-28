import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  FeretProvider,
  createStore,
  useObserver,
  useService,
  Service,
  wire,
  observable,
  browserPersist,
  persisted,
} from 'feret';
import { Annotated } from '../packages/feret/src';

@Service
@Annotated('Hello')
export class HelloService {
  @persisted @observable counter = 0;
  testInstance = wire(TestService);

  increment() {
    this.counter += this.testInstance.page;
  }
}

@Service
@Annotated('Test')
export class TestService {
  page = 2;
  helloInstance = wire(HelloService);

  show() {
    alert(this.helloInstance.counter);
  }
}

export function App() {
  useObserver([HelloService]);
  const hello = useService(HelloService);
  const test = useService(TestService);

  return (
    <div>
      {hello.counter}
      <button onClick={() => hello.increment()}>increment</button>
      <button onClick={() => test.show()}>show</button>
    </div>
  );
}

const store = createStore();

browserPersist(store, localStorage.getItem('saved_data'), (data) =>
  localStorage.setItem('saved_data', data),
);

store.orderedInvoke('created').then(() => {
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <FeretProvider store={store}>
        <App />
      </FeretProvider>
    </React.StrictMode>,
  );
});