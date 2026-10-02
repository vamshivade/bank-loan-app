# Angular HTTP Services: From Beginner to Advanced

## 🟢 Beginner Level: The Basics of Data Fetching

### Action Mapping: Which Pattern Goes With Which HTTP Verb?

| HTTP Verb | Operation Type | Modern Tool | Why |
| --- | --- | --- | --- |
| **`GET`** | **Fetch / Read** | **`httpResource`** | Populates UI. Provides automatic loading/error/data signals without boilerplate. |
| **`POST`** | **Create / Action** | **`firstValueFrom` (`async/await`)** | Form submissions, login, checkout. Runs once per click; uses clean `try/catch`. |
| **`PUT` / `PATCH**` | **Update / Action** | **`firstValueFrom` (`async/await`)** | Modifying existing records. Linear execution and explicit success/failure branching. |
| **`DELETE`** | **Remove / Action** | **`firstValueFrom` (`async/await`)** | Destructive action. Triggered on confirmation; awaits server response. |
| **`GET` (Live)** | **Reactive Stream** | **RxJS `pipe()` + `toSignal()**` | Search typeahead, autocomplete, live debouncing, or streaming where events change over time. |

---

---

### 1. `httpResource` (Data Fetching — `GET`)

Use this for fetching data to display on screen.

#### Service (`post.service.ts`)

```typescript
import { Injectable, httpResource } from '@angular/core';

export interface Post {
  id: number;
  title: string;
  body: string;
}

@Injectable({ providedIn: 'root' })
export class PostService {
  // Built-in GET request: value(), isLoading(), error(), reload() are provided automatically
  readonly postsResource = httpResource<Post[]>(() => '/api/posts');
}

```

#### Component (`post-list.component.ts`)

```typescript
import { Component, inject } from '@angular/core';
import { PostService } from './post.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  template: `
    <h2>Recent Posts</h2>

    @if (postService.postsResource.isLoading()) {
      <p>Loading posts...</p>
    } @else if (postService.postsResource.error()) {
      <p class="error">Could not load posts.</p>
    } @else if (postService.postsResource.value(); as posts) {
      <button (click)="postService.postsResource.reload()">Reload Posts</button>
      
      <ul>
        @for (post of posts; track post.id) {
          <li><strong>{{ post.title }}</strong></li>
        }
      </ul>
    }
  `
})
export class PostListComponent {
  readonly postService = inject(PostService);
}

```

---

---

### Are `.isLoading()`, `.error()`, `.value()`, and `.reload()` Built-in?

**Yes, they are 100% built-in by default.**

You do **not** write any manual signals, booleans, or error state trackers for them. When you declare `httpResource(...)`, Angular automatically returns a `ResourceRef` object that already contains:

* **`.value()`**: A Signal holding the returned data (or `undefined` while loading).
* **`.isLoading()`**: A Boolean Signal (`true` during request, `false` when finished).
* **`.error()`**: A Signal holding the error object if the request failed (or `undefined` on success).
* **`.reload()`**: A built-in method you can call directly to trigger a re-fetch.

---

---

## 🟡 Intermediate Level: Mutations and Parameters

### 2. `firstValueFrom` (Mutations — `POST`, `PUT`/`PATCH`, `DELETE`)

Use this whenever a user clicks a button to perform a specific action or form submission.

#### Service (`item.service.ts`)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Item {
  id?: string;
  title: string;
}

@Injectable({ providedIn: 'root' })
export class ItemService {
  private http = inject(HttpClient);

  // POST: Create a new resource
  createItem(data: { title: string }): Promise<Item> {
    return firstValueFrom(this.http.post<Item>('/api/items', data));
  }

  // PUT / PATCH: Update an existing resource
  updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    return firstValueFrom(this.http.patch<Item>(`/api/items/${id}`, updates));
  }

  // DELETE: Remove a resource
  deleteItem(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/items/${id}`));
  }
}

```

#### Component (`item-manager.component.ts`)

```typescript
import { Component, inject, signal } from '@angular/core';
import { ItemService } from './item.service';

@Component({
  selector: 'app-item-manager',
  standalone: true,
  template: `
    <button (click)="handleCreate()" [disabled]="isSubmitting()">Create Item</button>
    <button (click)="handleUpdate('123')" [disabled]="isSubmitting()">Update Item</button>
    <button (click)="handleDelete('123')" [disabled]="isSubmitting()">Delete Item</button>

    @if (error()) {
      <p class="error">{{ error() }}</p>
    }
  `
})
export class ItemManagerComponent {
  private itemService = inject(ItemService);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);

  async handleCreate() {
    this.isSubmitting.set(true);
    this.error.set(null);
    try {
      const newItem = await this.itemService.createItem({ title: 'New Document' });
      console.log('Created item:', newItem);
    } catch (err: any) {
      this.error.set(err.error?.message || 'Failed to create item');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async handleUpdate(id: string) {
    this.isSubmitting.set(true);
    try {
      await this.itemService.updateItem(id, { title: 'Updated Title' });
    } catch (err: any) {
      this.error.set(err.error?.message || 'Failed to update item');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async handleDelete(id: string) {
    if (!confirm('Are you sure?')) return;

    this.isSubmitting.set(true);
    try {
      await this.itemService.deleteItem(id);
    } catch (err: any) {
      this.error.set(err.error?.message || 'Failed to delete item');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

```

---

---

### Pattern 1: Encapsulated in the Service (Recommended)

Managing `.reload()` inside the service guarantees that whenever a write action (`POST`, `PUT`, `DELETE`) succeeds, the cached resource re-fetches from the server.

#### Service (`todo.service.ts`)

```typescript
import { Injectable, inject, httpResource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Todo {
  id: number;
  title: string;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);

  // 1. Read Resource (GET)
  readonly todosResource = httpResource<Todo[]>(() => '/api/todos');

  // 2. POST (Create) + Reload
  async addTodo(title: string): Promise<Todo> {
    const newTodo = await firstValueFrom(
      this.http.post<Todo>('/api/todos', { title })
    );

    // Automatically re-fetch the list
    this.todosResource.reload();

    return newTodo;
  }

  // 3. DELETE + Reload
  async deleteTodo(id: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`/api/todos/${id}`)
    );

    // Automatically re-fetch the list
    this.todosResource.reload();
  }
}

```

#### Component (`todo-list.component.ts`)

The component only handles calling the mutation; it never needs to touch `.reload()`.

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="todo-app">
      <div class="add-box">
        <input [(ngModel)]="newTitle" placeholder="New todo title..." />
        <button (click)="handleAdd()" [disabled]="submitting()">Add</button>
      </div>

      @if (todoService.todosResource.isLoading()) {
        <p>Loading items...</p>
      } @else if (todoService.todosResource.value(); as todos) {
        <ul>
          @for (item of todos; track item.id) {
            <li>
              <span>{{ item.title }}</span>
              <button (click)="handleDelete(item.id)" [disabled]="submitting()">Delete</button>
            </li>
          }
        </ul>
      }
    </div>
  `
})
export class TodoListComponent {
  readonly todoService = inject(TodoService);

  newTitle = '';
  submitting = signal(false);

  async handleAdd() {
    if (!this.newTitle.trim()) return;

    this.submitting.set(true);
    try {
      await this.todoService.addTodo(this.newTitle);
      this.newTitle = ''; // Reset input; the list re-renders automatically
    } finally {
      this.submitting.set(false);
    }
  }

  async handleDelete(id: number) {
    this.submitting.set(true);
    try {
      await this.todoService.deleteTodo(id);
    } finally {
      this.submitting.set(false);
    }
  }
}

```

---

---

### Pattern 2: Component-Level Triggering

If your service is a thin API client and multiple components share the resource differently, invoke `.reload()` directly from the component's `try` block:

```typescript
async handleDelete(id: number) {
  try {
    await this.todoService.deleteTodo(id);
    // Explicitly tell the resource to refresh
    this.todoService.todosResource.reload();
  } catch (err) {
    console.error('Failed to delete item', err);
  }
}

```

---

---

### Basic Request Configuration with Query Params & Headers

```typescript
import { Component, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';

export interface User {
  id: number;
  name: string;
  role: string;
}

@Component({
  selector: 'app-users-view',
  standalone: true,
  template: `
    <!-- Filters -->
    <input 
      type="text" 
      [value]="searchTerm()" 
      (input)="searchTerm.set($any($event.target).value)" 
      placeholder="Search..." 
    />

    <select [value]="selectedRole()" (change)="selectedRole.set($any($event.target).value)">
      <option value="all">All Roles</option>
      <option value="admin">Admin</option>
      <option value="editor">Editor</option>
    </select>

    <button (click)="page.set(page() + 1)">Next Page ({{ page() }})</button>

    <!-- UI State -->
    @if (usersResource.isLoading()) {
      <p>Loading page {{ page() }}...</p>
    } @else if (usersResource.value(); as users) {
      <ul>
        @for (user of users; track user.id) {
          <li>{{ user.name }} ({{ user.role }})</li>
        }
      </ul>
    }
  `
})
export class UsersViewComponent {
  readonly searchTerm = signal('');
  readonly selectedRole = signal('all');
  readonly page = signal(1);

  // Return a request object instead of just a string
  readonly usersResource = httpResource<User[]>(() => ({
    url: '/api/v1/users',
    method: 'GET',
    
    // Automatically converted to query string: ?search=...&role=...&page=...&limit=10
    params: {
      search: this.searchTerm(),
      role: this.selectedRole(),
      page: this.page(),
      limit: 10
    },

    // Custom headers
    headers: {
      'X-Client-Version': '1.0.0',
      'X-App-Region': 'ap-south-1'
    }
  }));
}

```

---

---

### Request Object Properties Supported

When returning an object inside the request computation, you can supply:

| Property | Type | Description |
| --- | --- | --- |
| `url` | `string` | **Required.** The endpoint URL. |
| `method` | `string` | HTTP verb (`'GET'`, `'POST'`, `'PUT'`, etc.). Defaults to `'GET'`. |
| `params` | `Record<string, string | number |
| `headers` | `Record<string, string>` or `HttpHeaders` | Custom request headers. |
| `body` | `unknown` | Request payload (useful if a backend uses `POST` for search queries). |
| `reportProgress` | `boolean` | Whether to track upload/download progress. |
| `withCredentials` | `boolean` | Sends cross-site cookies with the request. |

---

---

### Sending a POST Request with Body and Params

If you have a search or reporting API that requires a `POST` request with JSON criteria, you can construct it directly:

```typescript
readonly reportCriteria = signal({ department: 'Engineering', activeOnly: true });

readonly reportResource = httpResource<ReportData>(() => ({
  url: '/api/reports/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  params: {
    format: 'condensed' // ?format=condensed
  },
  body: this.reportCriteria() // Sent as the JSON request payload
}));

```

---

---

### Using the Second Argument: `defaultValue` and `map`

`httpResource` accepts an optional second options argument to configure behavior like fallback values and data mapping:

```typescript
interface ApiResponse {
  data: User[];
  meta: { total: number };
}

readonly usersResource = httpResource<ApiResponse, User[]>(
  () => ({
    url: '/api/users',
    params: { page: this.page() }
  }),
  {
    // 1. Initial value before any HTTP response arrives (avoids 'undefined')
    defaultValue: [],

    // 2. Transform the raw backend response before it reaches .value()
    map: (res: ApiResponse) => res.data
  }
);

```

By providing `defaultValue`, `usersResource.value()` is typed as `User[]` instead of `User[] | undefined`, simplifying template rendering.

To conditionally prevent `httpResource` from firing, **return `undefined**` from the request computation function.

When `undefined` is returned, `httpResource` transitions to an idle state: it cancels any pending network request, sets `.isLoading()` to `false`, and does not make an HTTP call until the tracked signals change into a valid state.

---

---

### Example 1: Dropdown / Filter Signal

When a user selects a new category or changes a filter, updating the signal triggers an immediate re-fetch.

#### Service / Component (`product-catalog.component.ts`)

```typescript
import { Component, signal, httpResource } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Product {
  id: number;
  title: string;
  category: string;
}

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="filters">
      <label>Category:</label>
      <select [ngModel]="selectedCategory()" (ngModelChange)="selectedCategory.set($event)">
        <option value="electronics">Electronics</option>
        <option value="jewelery">Jewelry</option>
        <option value="men's clothing">Men's Clothing</option>
      </select>
    </div>

    @if (productsResource.isLoading()) {
      <p>Loading products...</p>
    } @else if (productsResource.error(); as err) {
      <p class="error">Failed to load: {{ err }}</p>
    } @else if (productsResource.value(); as products) {
      <ul>
        @for (item of products; track item.id) {
          <li>{{ item.title }}</li>
        }
      </ul>
    }
  `
})
export class ProductCatalogComponent {
  // 1. Reactive state driving the request
  readonly selectedCategory = signal('electronics');

  // 2. httpResource automatically tracks `this.selectedCategory()`
  readonly productsResource = httpResource<Product[]>(() => {
    const category = encodeURIComponent(this.selectedCategory());
    return `https://fakestoreapi.com/products/category/${category}`;
  });
}

```

---

---

### Example 2: Route Parameter with Signal Inputs

With `withComponentInputBinding()` enabled in your `app.config.ts`, route parameters (e.g., `/users/:id`) bind directly to component `input()` signals. Reading that `input()` inside `httpResource` will re-fetch data whenever the URL changes.

#### 1. Enable Router Component Input Binding (`app.config.ts`)

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding())
  ]
};

```

#### 2. Component Consuming Route Param (`user-detail.component.ts`)

```typescript
import { Component, input, httpResource } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  template: `
    @if (userResource.isLoading()) {
      <p>Loading user profile...</p>
    } @else if (userResource.value(); as user) {
      <h2>{{ user.name }}</h2>
      <p>Email: {{ user.email }}</p>
    }
  `
})
export class UserDetailComponent {
  // Route parameter ':id' is bound directly as an input Signal
  readonly id = input.required<string>();

  // Tracks `this.id()`: navigating from /users/1 to /users/2 auto-fetches user 2
  readonly userResource = httpResource<User>(() => `/api/users/${this.id()}`);
}

```

---

---

### Pausing Requests Conditionally

If the dropdown is unselected or the route parameter is temporarily missing, return `undefined` from the function. `httpResource` will pause and avoid firing the HTTP request until a valid value is set:

```typescript
readonly selectedUserId = signal<string | null>(null);

readonly userResource = httpResource<User>(() => {
  const userId = this.selectedUserId();
  
  // Returning undefined tells httpResource NOT to send a request
  if (!userId) {
    return undefined;
  }

  return `/api/users/${userId}`;
});

```

---

---

### Example: Requiring a Minimum Query Length & Valid ID

```typescript
import { Component, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

export interface SearchResult {
  id: number;
  name: string;
}

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [FormsModule],
  template: `
    <input 
      type="text" 
      [ngModel]="query()" 
      (ngModelChange)="query.set($event)" 
      placeholder="Type at least 3 characters..." 
    />

    @if (searchResource.isLoading()) {
      <p>Searching...</p>
    } @else if (searchResource.value(); as results) {
      <ul>
        @for (item of results; track item.id) {
          <li>{{ item.name }}</li>
        } @empty {
          @if (query().trim().length >= 3) {
            <li>No results found.</li>
          }
        }
      </ul>
    }
  `
})
export class UserSearchComponent {
  readonly query = signal('');
  readonly selectedOrgId = signal<number | null>(null);

  readonly searchResource = httpResource<SearchResult[]>(
    () => {
      const term = this.query().trim();
      const orgId = this.selectedOrgId();

      // 1. Validation guard: Skip execution if invalid or missing
      if (term.length < 3 || orgId === null) {
        return undefined; // <-- Prevents the HTTP request completely
      }

      // 2. Return config or URL only when valid
      return {
        url: '/api/v1/search',
        params: {
          q: term,
          orgId: orgId
        }
      };
    },
    {
      // Optional: keep an empty array as value instead of undefined
      defaultValue: []
    }
  );
}

```

---

---

### What Happens When You Return `undefined`?

| Property | Behavior when returning `undefined` |
| --- | --- |
| **Network Request** | **Never dispatched.** If a previous request was still in-flight, it is immediately aborted. |
| **`.isLoading()`** | Evaluates to `false`. |
| **`.error()`** | Remains `undefined`. |
| **`.value()`** | Holds `defaultValue` (if defined in options) or `undefined`. |
| **Reactive Tracking** | **Still active.** Signals read before returning `undefined` (like `this.query()`) continue to be tracked. As soon as `this.query()` hits 3 characters, the request fires automatically. |

---

---

### Multi-Condition Validation Pattern

You can combine multiple criteria into clean guard clauses:

```typescript
readonly detailsResource = httpResource<ItemDetails>(() => {
  const itemId = this.selectedId();
  const token = this.authService.token();
  const isEnabled = this.featureFlagService.isEnabled();

  // Guard: User not logged in, feature disabled, or ID missing
  if (!itemId || !token || !isEnabled) {
    return undefined;
  }

  return {
    url: `/api/items/${itemId}`,
    headers: { Authorization: `Bearer ${token}` }
  };
});

```

To add debouncing to an `httpResource` without converting your HTTP logic back to RxJS, isolate the debounce to the **input signal itself** using a small `debouncedSignal` helper.

Your `httpResource` continues to run on pure Signals with all of its built-in perks (`.value()`, `.isLoading()`, `.error()`), but it only re-evaluates when the debounced signal emits.

---

---

## 🔴 Advanced Level: Streams, Aborts, and Caching

### 3. RxJS `pipe()` (Stream Operators — Live Search `GET`)

Use this when you are dealing with continuous streams, debouncing, or rate limiting.

#### Service (`search.service.ts`)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);

  search(term: string): Observable<string[]> {
    return this.http.get<string[]>(`/api/search?q=${term}`);
  }
}

```

#### Component (`search.component.ts`)

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule],
  template: `
    <input 
      type="text" 
      [ngModel]="query()" 
      (ngModelChange)="query.set($event)" 
      placeholder="Type to search..." 
    />

    <ul>
      @for (item of results(); track item) {
        <li>{{ item }}</li>
      }
    </ul>
  `
})
export class SearchComponent {
  private searchService = inject(SearchService);

  readonly query = signal('');

  // Pipe controls the stream timing and cancels obsolete HTTP requests
  readonly results = toSignal(
    toObservable(this.query).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => (term ? this.searchService.search(term) : of([])))
    ),
    { initialValue: [] }
  );
}

```

To refresh an `httpResource` after a mutation, call its built-in `.reload()` method once the `firstValueFrom` promise resolves.

The cleanest architecture encapsulates this inside the **Service** so that any component displaying the resource updates automatically without needing to remember to trigger a refresh manually.

---

---

### Alternative: Optimistic Updates via `.update()`

If you want the UI to feel instant without waiting for the server round-trip or making an extra GET request, update the resource's `.value()` signal directly before or alongside the network call:

```typescript
async deleteTodoOptimistic(id: number): Promise<void> {
  // 1. Immediately remove the item from local state
  this.todosResource.update((current) => current?.filter((t) => t.id !== id));

  try {
    // 2. Send the delete request to the server
    await firstValueFrom(this.http.delete(`/api/todos/${id}`));
  } catch (err) {
    // 3. Roll back by re-fetching if server call fails
    this.todosResource.reload();
    throw err;
  }
}

```

`httpResource` behaves like a `computed()` signal. Any signal you read inside the resource's URL function is automatically tracked as a reactive dependency. Whenever that signal updates, `httpResource` automatically aborts any pending request and fetches the new data.

---

---

### Step 1: Create a Reusable `debouncedSignal` Helper

This utility turns a fast-changing signal into a debounced signal. RxJS is contained in these 6 lines solely for timing—it never touches your HTTP or service layer.

```typescript
// utils/debounced-signal.ts
import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs/operators';

export function debouncedSignal<T>(source: Signal<T>, timeMs = 300): Signal<T> {
  return toSignal(
    toObservable(source).pipe(debounceTime(timeMs)),
    { initialValue: source() }
  );
}

```

---

---

### Step 2: Connect It to `httpResource`

Pass the debounced signal into `httpResource`. The resource automatically tracks `debouncedQuery()` instead of `query()`, preventing HTTP requests until the user stops typing for 300ms.

```typescript
// search-users.component.ts
import { Component, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { debouncedSignal } from './debounced-signal';

export interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-search-users',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- 1. Two-way bound to the immediate signal -->
    <input 
      type="text" 
      [ngModel]="query()" 
      (ngModelChange)="query.set($event)" 
      placeholder="Type at least 2 characters..." 
    />

    <!-- 2. UI reacts only after 300ms pause -->
    @if (searchResource.isLoading()) {
      <p class="status">Searching...</p>
    } @else if (searchResource.value(); as users) {
      <ul>
        @for (user of users; track user.id) {
          <li>{{ user.name }}</li>
        } @empty {
          @if (debouncedQuery().trim().length >= 2) {
            <li>No matches found.</li>
          }
        }
      </ul>
    }
  `
})
export class SearchUsersComponent {
  // Raw signal updating on every keystroke
  readonly query = signal('');

  // Rate-limited signal updating 300ms after the last keystroke
  readonly debouncedQuery = debouncedSignal(this.query, 300);

  // httpResource tracks debouncedQuery instead of query
  readonly searchResource = httpResource<User[]>(() => {
    const term = this.debouncedQuery().trim();

    // Guard: Don't fire if fewer than 2 characters
    if (term.length < 2) {
      return undefined;
    }

    return {
      url: '/api/v1/users',
      params: { search: term }
    };
  });
}

```

---

---

### Alternative: Pure JavaScript (Zero RxJS Imports)

If you prefer to avoid `toObservable` and `toSignal` entirely, debounce the signal manually using `setTimeout` directly inside an input method:

```typescript
export class SearchUsersPureComponent {
  readonly debouncedQuery = signal('');
  private debounceTimer?: ReturnType<typeof setTimeout>;

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debouncedQuery.set(value);
    }, 300);
  }

  readonly searchResource = httpResource<User[]>(() => {
    const term = this.debouncedQuery().trim();
    if (!term) return undefined;

    return {
      url: '/api/v1/users',
      params: { search: term }
    };
  });
}

```

---

---

### How the Data Flows

```
User Keystroke ('a' -> 'ap' -> 'app')
                 ↓
           query.set()           (Fires on every letter)
                 ↓
         [ 300ms pause ]
                 ↓
       debouncedQuery.set()      (Fires once)
                 ↓
       httpResource triggers     (Sends single GET request)

```

This keeps the separation clean: your template binds immediately for responsive typing, but `httpResource` is triggered only when the debounced signal settles.

`httpResource` is built directly on top of Angular’s core **`resource()`** primitive. Under the hood, it creates and manages a browser-native **`AbortController`** for every request cycle, wiring its `AbortSignal` directly into Angular's HTTP client architecture.

Here is exactly how the cancellation pipeline works step-by-step.

---

---

### Key Behaviors Behind the Scenes

* **Automatic Cleanup:** If a user rapidly switches dropdown options from "Electronics" to "Jewelry", `httpResource` automatically cancels the in-flight request for "Electronics" via an internal `AbortController`.
* **Zero Boilerplate:** No `switchMap`, `takeUntilDestroyed`, or manual `ActivatedRoute.paramMap.subscribe()` required.

Instead of returning a plain URL string from the `httpResource` computation function, return a **request configuration object** containing `url`, `params`, `headers`, and other HTTP settings.

`httpResource` is imported from `@angular/common/http`. Any signal referenced inside this configuration function is automatically tracked.

---

---

### 1. The Automatic Lifecycle: Abort on Dependency Change

Whenever an input signal read inside `httpResource` updates, the following sequence occurs internally:

```
Signal changes (e.g. query.set('new'))
                ↓
1. Existing AbortController.abort() is called
                ↓
2. Browser socket for in-flight request is immediately killed
                ↓
3. New AbortController is instantiated
                ↓
4. New HTTP request is dispatched with new AbortSignal

```

If a user triggers five requests in rapid succession, `httpResource` does not wait for responses to arrive or complete. It actively cancels requests 1 through 4, ensuring only the latest request consumes network bandwidth and updates `.value()`.

---

---

### 2. How the Abort Reaches the Wire (`withFetch` vs `XHR`)

The actual termination of the network packet depends on how `provideHttpClient` is configured in your `app.config.ts`:

* **With `withFetch()` (Standard / Recommended):**
When configured with `provideHttpClient(withFetch())`, Angular uses the browser's native `fetch()` API. Angular passes the internal `AbortSignal` directly into the native call:
```javascript
fetch(url, { signal: internalAbortController.signal, ... })

```


Calling `.abort()` immediately drops the TCP connection at the browser level (visible in DevTools as `(canceled)`).
* **Standard `XMLHttpRequest` (Fallback):**
If `withFetch()` is omitted, Angular’s internal HTTP handler calls `xhr.abort()` when the cancellation signal trips.

---

---

### 3. Component Destruction Cleanup

`httpResource` registers itself with the surrounding **`DestroyRef`** (the component or service lifecycle context where it was initialized).

If a user navigates away from the page while a 2MB payload is downloading:

1. The component unmounts.
2. The `DestroyRef` executes teardown hooks.
3. `httpResource` immediately trips `abort()`.
4. No data is stored, and no memory leaks or `Cannot set state on unmounted component` warnings can occur.

---

---

### 4. Race Condition Protection (Stale Response Shield)

Beyond terminating connections, `AbortSignal` shields your UI against out-of-order packet delivery:

* **The Problem:** Request A (slow, 800ms) is sent before Request B (fast, 150ms). Without cancellation, Request A finishes last and overwrites the newer data from Request B.
* **How `httpResource` Solves This:** Even if a server ignores the abort signal and returns a 200 payload for Request A, `httpResource` inspects `signal.aborted`. Because Request A's controller was already aborted, the incoming payload is discarded, and `.value()` is never overwritten with stale data.

---

---

### 5. Low-Level Exposure: `resource()` vs `httpResource()`

`httpResource` abstracts the signal away so you don't have to manually pass `signal` into your request config.

However, if you drop down to the underlying **`resource()`** API to write custom fetchers, Angular explicitly passes you the active `AbortSignal`:

```typescript
import { Component, resource, signal } from '@angular/core';

@Component({ ... })
export class ManualResourceComponent {
  userId = signal(1);

  userResource = resource({
    // 1. Angular re-runs loader when userId() changes
    request: () => ({ id: this.userId() }),

    // 2. Angular injects abortSignal as a parameter
    loader: async ({ request, abortSignal }) => {
      // Pass the abortSignal directly to native fetch or any 3rd-party SDK
      const res = await fetch(`/api/users/${request.id}`, {
        signal: abortSignal 
      });

      if (!res.ok) throw new Error('Fetch failed');
      return res.json();
    }
  });
}

```

If `userId` changes while `fetch()` is pending, Angular triggers `abortSignal.abort()`, throwing an `AbortError` inside the loader that the resource marks as cancelled without surfacing a false runtime crash.

`httpResource` does not maintain a custom in-memory cache layer (unlike libraries such as TanStack Query or Apollo); instead, it delegates caching entirely to the **standard browser HTTP cache engine** and the underlying `HttpClient`.

Whenever `httpResource` executes or re-evaluates, the browser inspects response headers (`Cache-Control`, `ETag`, `Last-Modified`) to decide whether to hit the network, serve from disk/memory cache, or perform a conditional validation.

---

---

### 1. How `Cache-Control` Dictates `httpResource`

When your backend includes `Cache-Control` headers, the browser manages the freshness of the data returned to `httpResource`:

```
Backend Response Header:
Cache-Control: public, max-age=120

```

* **Within 120 seconds:** If an input signal changes back and forth, or another component mounts and triggers the same URL, the browser intercepts the call and serves it directly from disk/memory (`200 OK (from disk cache)`). No network packet leaves the device.
* **UI Lifecycle:** `httpResource.isLoading()` will briefly toggle to `true` and immediately to `false`, populating `.value()` with zero network latency.
* **Expired (`max-age` elapsed):** Once stale, the browser allows the request to reach the server to retrieve fresh data.

---

---

### 2. How `ETag` and `304 Not Modified` Work

`ETag` enables conditional revalidation without re-downloading identical payloads:

```
Step 1: First Request
Frontend (httpResource)  ─────── GET /api/users ───────►  Server
Frontend (httpResource)  ◄── 200 OK (ETag: "abc_1") ───  Server

Step 2: Subsequent Request / .reload()
Frontend (httpResource)  ── GET (If-None-Match: "abc_1") ─► Server
Frontend (httpResource)  ◄───── 304 Not Modified ────────── Server
                         (Browser feeds cached body)

```

1. **Initial Call:** The server returns `200 OK` with an identifier header: `ETag: "68bf524d"`. The browser saves the response body and associates it with that ETag.
2. **Subsequent Call or `.reload()`:** The browser automatically attaches `If-None-Match: "68bf524d"` to the outgoing request header.
3. **Server Validation:**
* If data hasn't changed, the backend returns a lightweight `304 Not Modified` header with an empty body.
* The browser intercepts the `304`, pulls the previous body from its internal cache, and passes it to Angular's `httpResource`.
* `httpResource.value()` receives the data seamlessly without throwing an error, while saving bandwidth.



---

---

### 3. What Happens When You Call `.reload()`?

A common misconception is that `httpResource.reload()` forces a hard cache bypass.

Calling `.reload()` simply **re-executes the HTTP pipeline**. If the server returned `Cache-Control: max-age=3600` and the browser considers the asset fresh, calling `.reload()` will simply reload the cached response from the browser cache without reaching the server.

#### Forcing a Fresh Fetch (Cache Bypass)

If you need `.reload()` to bypass the browser cache and force a server trip, pass cache-control headers directly inside the request computation:

```typescript
import { Component, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';

@Component({ ... })
export class UserListComponent {
  readonly forceRefresh = signal(false);

  readonly usersResource = httpResource<User[]>(() => ({
    url: '/api/users',
    headers: this.forceRefresh()
      ? {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      : {}
  }));

  hardReload() {
    this.forceRefresh.set(true);
    this.usersResource.reload();
    this.forceRefresh.set(false);
  }
}

```

---

---

### 4. Native `fetch` Cache Modes via `provideHttpClient(withFetch())`

When configuring Angular with `withFetch()`, you can also configure browser cache policies globally or via interceptors:

| Cache-Control Strategy | Browser Behavior | Impact on `httpResource` |
| --- | --- | --- |
| `max-age=X` | Serves response from local storage until time expires. | Instant UI resolution; zero bandwidth used while fresh. |
| `no-cache` | Must revalidate with server (`ETag` / `If-None-Match`). | Server returns `304`; updates `.value()` using cached payload. |
| `no-store` | Completely disables caching on disk/memory. | Every dependency change or `.reload()` initiates a full payload download. |

A client-side **Stale-While-Revalidate (SWR)** interceptor immediately serves cached responses from memory while quietly dispatching a network request in the background to refresh the cache and emit the latest data.

---

---

### Step 1: Define Cache Tokens and Cache Store

Create an `HttpContextToken` to configure caching per-request, alongside a lightweight in-memory cache service.

```typescript
// services/http-cache.service.ts
import { Injectable, HttpContextToken } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

export interface CacheEntry {
  response: HttpResponse<unknown>;
  savedAt: number;
}

// 1. Context tokens to control caching behavior per request
export const CACHE_ENABLED = new HttpContextToken<boolean>(() => true);
export const CACHE_TTL_MS = new HttpContextToken<number>(() => 60_000); // 1 minute default

@Injectable({ providedIn: 'root' })
export class HttpCacheService {
  private readonly cache = new Map<string, CacheEntry>();

  get(key: string, ttlMs: number): HttpResponse<unknown> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.savedAt > ttlMs;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  set(key: string, response: HttpResponse<unknown>): void {
    this.cache.set(key, {
      response,
      savedAt: Date.now(),
    });
  }

  invalidate(urlPattern?: string): void {
    if (!urlPattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(urlPattern)) {
        this.cache.delete(key);
      }
    }
  }
}

```

---

---

### Step 2: Implement the Functional Interceptor

Using modern Angular functional interceptors (`HttpInterceptorFn`), intercept `GET` requests, serve the stale response immediately, and stream the fresh response when it arrives using RxJS `concat`.

```typescript
// interceptors/cache.interceptor.ts
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, concat } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { HttpCacheService, CACHE_ENABLED, CACHE_TTL_MS } from '../services/http-cache.service';

export const staleWhileRevalidateInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Only cache GET requests that have caching enabled
  if (req.method !== 'GET' || !req.context.get(CACHE_ENABLED)) {
    return next(req);
  }

  const cache = inject(HttpCacheService);
  const cacheKey = req.urlWithParams;
  const ttl = req.context.get(CACHE_TTL_MS);
  const cachedResponse = cache.get(cacheKey, ttl);

  // 2. Prepare the background network request (Revalidation)
  const networkRequest$ = next(req).pipe(
    filter((event): event is HttpResponse<unknown> => event instanceof HttpResponse),
    tap((freshResponse) => {
      if (freshResponse.ok) {
        cache.set(cacheKey, freshResponse);
      }
    })
  );

  // 3. Cache Miss: Dispatch directly to the network
  if (!cachedResponse) {
    return networkRequest$;
  }

  // 4. Stale-While-Revalidate: Emit cached immediately, then emit fresh when resolved
  return concat(
    of(cachedResponse.clone()), // Stale emission (instant UI)
    networkRequest$              // Fresh emission (background sync)
  );
};

```

---

---

### Step 3: Register the Interceptor

Add `withInterceptors` inside your application configuration.

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { staleWhileRevalidateInterceptor } from './interceptors/cache.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withFetch(),
      withInterceptors([staleWhileRevalidateInterceptor])
    )
  ]
};

```

---

---

### Step 4: How It Operates in Components and Services

#### With Standard Observable (`toSignal` or `.subscribe()`)

Because `concat` emits twice (first the cached payload, then the server payload), components bound via `toSignal()` or standard subscriptions will update **instantly**, and then silently update a second time if the server has newer data:

```typescript
// user-profile.component.ts
import { Component, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { CACHE_TTL_MS } from '../services/http-cache.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  template: `
    <div>
      <h3>{{ user()?.name }}</h3>
      <p>{{ user()?.email }}</p>
    </div>
  `
})
export class UserProfileComponent {
  private http = inject(HttpClient);

  // Fires immediately with cached data, then auto-updates when network finishes
  readonly user = toSignal(
    this.http.get<{ name: string; email: string }>('/api/me', {
      context: new HttpContext().set(CACHE_TTL_MS, 300_000) // 5 min TTL
    })
  );
}

```

#### Opting Out of Cache for Specific Requests

To bypass the cache on critical calls (like live transactions):

```typescript
this.http.get('/api/live-status', {
  context: new HttpContext().set(CACHE_ENABLED, false)
});

```

---

---

### How SWR Differs from Standard Memory Caching

| Feature | Standard Cache Interceptor | Stale-While-Revalidate (SWR) |
| --- | --- | --- |
| **Cache Hit** | Returns cached data and stops. | Returns cached data **and** fires background request. |
| **Data Freshness** | Data stays frozen until TTL fully expires. | Data updates in the background automatically on every visit. |
| **Perceived Speed** | 0ms (Instant). | 0ms (Instant) + eventual consistency. |
| **Emissions Count** | Single emission (`Observable` completes). | Two emissions (Cached `HttpResponse`, then Fresh `HttpResponse`). |

---

