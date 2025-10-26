# redux-store

Generic Redux Toolkit CRUD store for backend-server APIs.

## Install

```
npm i
```

## Build

```
npm run build
```

## Usage (React)

```
import { Provider } from 'react-redux';
import { store, slices } from 'redux-store';

// Dispatch list
store.dispatch(slices.products.thunks.list({ params: { limit: 10 } }));

// In app
<Provider store={store}>{/* your app */}</Provider>
```

API base defaults to http://localhost:4000. Override with NEXT_PUBLIC_API_BASE.
