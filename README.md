# Jiccup

A simplified JavaScript implementation of the Clojure Hiccup library (https://github.com/weavejester/jiccup) for generating HTML using data structures. Write HTML using JavaScript arrays and objects with a clean, functional approach. This code was generated with the help of Claude Code.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Zero Dependencies** - Pure JavaScript implementation
- 🎯 **Checked Public Types** - Provider-owned declarations connected to JavaScript exports
- 🔒 **XSS Protection** - Automatic HTML escaping by default
- 🎨 **CSS-in-JS** - Object-style CSS with camelCase to kebab-case conversion
- ⚡ **Performance** - Tag parsing cache and optimized rendering
- 🧩 **Function Components** - Reusable component functions
- 📦 **ES6 Modules** - Modern JavaScript module system
- 🎭 **Event Handling** - Built-in event binding with `on:` prefix
- 🔄 **Conditional Rendering** - Smart handling of falsy values
- 🏷️ **Flexible Selectors** - CSS-style selectors with ID and classes in any order

## Installation

```bash
# Copy jiccup.js to your project
# Or use as ES6 module
```

```javascript
import { jiccup } from './jiccup.js';
```

## 型と公開契約

実行コードは Plain JavaScript のままです。型正本の `types.d.ts` と公開JSDocを一緒に配置し、`jiccup.js` を直接検査します。同名の `jiccup.d.ts` で本体を隠しません。アプリのグローバル型はこの提供型を参照します。

- `html()` の属性にはイベント関数を渡せません。渡すと `JiccupError/INVALID_ELEMENT` で停止し、`render()` の使用を案内します。`render()` は `on:*` 関数の binding を生成し、返却結果の `attach(container)` がDOMへ登録します。
- `JiccupNode` は通常要素を保存する再帰的な部分集合です。異種componentの必須propsは公開APIのgeneric検査で照合します。保存するcomponent tupleには個別の `JiccupComponentNode<Props, Return>` または正確なtuple型を使い、任意propsへ消去しません。
- componentは一つのprops objectを受け取ります。`children` は位置引数の子群で上書きされます。
- 属性objectは要素の第2位置だけに置きます。`undefined`、裸の属性object、未検査の `unknown[]` は正規ノードに含みません。`false` と `null` は省略値です。
- 非文字列先頭の子群は展開されます。文字列先頭はtagとして解釈されるため、一般文字列配列のflattenは保証しません。
- `fragment()` はsentinel literalと各子ノード型を保存します。返型は子数・位置相関を保証しません。raw fragment sentinelは通常string tagとの重なりがあるため、完全な静的拒否は保証しません。
- `attach(container)` と `cleanup(container)` は必須selectorまたは `Element` を受け、実際の `Element` を返します。`reportError(element, context)` はreportまたは `null` を返します。

既存のclass/style/id変換を型整理のために変更しません。正常な描画、escaping、原throw値、handler参照、イベント順序とDOM identityはnative・ブラウザ回帰で検証します。

## Quick Start

```javascript
// Basic element
jiccup.html(['div', 'Hello World'])
// → <div>Hello World</div>

// With ID and classes
jiccup.html(['div#main.container.active', 'Content'])
// → <div id="main" class="container active">Content</div>

// With attributes
jiccup.html(['a', {href: 'https://example.com', target: '_blank'}, 'Link'])
// → <a href="https://example.com" target="_blank">Link</a>

// Nested structure
jiccup.html(['div.card',
  ['h2', 'Title'],
  ['p', 'Description'],
  ['button', {type: 'button'}, 'Click me']
])
// → <div class="card"><h2>Title</h2><p>Description</p><button type="button">Click me</button></div>
```

## Core API

### `jiccup.html(...elements)`

Convert Jiccup data structures to HTML strings.

```javascript
// Single element
jiccup.html(['div', 'Content'])

// Multiple elements
jiccup.html(
  ['h1', 'Title'],
  ['p', 'Paragraph 1'],
  ['p', 'Paragraph 2']
)
```

### `jiccup.render(element)`

Generate HTML with event bindings for DOM manipulation.

```javascript
const result = jiccup.render(['button', {
  'on:click': () => alert('Clicked!')
}, 'Click me']);

// Attach to DOM
result.attach(document.getElementById('container'));
```


## Element Syntax

### Tag with ID and Classes

```javascript
// CSS selector-like syntax
jiccup.html(['div#header.nav.active'])
// → <div id="header" class="nav active"></div>

// Multiple classes
jiccup.html(['span.btn.btn-primary.large'])
// → <span class="btn btn-primary large"></span>

// Flexible order (ID and classes can be in any order)
jiccup.html(['div.container.active#main'])
// → <div id="main" class="container active"></div>
```

### Attributes

```javascript
// Object attributes
jiccup.html(['input', {
  type: 'email',
  placeholder: 'Enter email',
  required: true,
  disabled: false  // false attributes are omitted
}])
// → <input type="email" placeholder="Enter email" required>

// Boolean and null attributes
jiccup.html(['input', {checked: true}])   // → <input checked>
jiccup.html(['input', {checked: false}])  // → <input>
jiccup.html(['input', {checked: null}])   // → <input> (null also omits attribute)
```

### CSS Styles

```javascript
// Object styles (camelCase to kebab-case)
jiccup.html(['div', {
  style: {
    backgroundColor: '#f0f0f0',
    fontSize: '16px',
    marginTop: '10px'
  }
}, 'Styled content'])
// → <div style="background-color: #f0f0f0; font-size: 16px; margin-top: 10px">Styled content</div>

// String styles
jiccup.html(['div', {style: 'color: red; margin: 5px'}, 'Red text'])
// → <div style="color: red; margin: 5px">Red text</div>
```

### Dynamic Classes

```javascript
const isActive = true;
const isError = false;

jiccup.html(['button', {
  class: [
    'btn',
    'btn-lg',
    isActive && 'active',
    isError && 'error'
  ].filter(Boolean)
}, 'Dynamic Button'])
// → <button class="btn btn-lg active">Dynamic Button</button>
```

## Advanced Features

### Function Components

Create reusable components with functions:

```javascript
// Define component
const Card = ({title, content, theme = 'default'}) =>
  ['div', {class: `card card-${theme}`},
    ['h3', {class: 'card-title'}, title],
    ['div', {class: 'card-body'}, content]
  ];

// Use component
jiccup.html([Card, {
  title: 'Welcome',
  content: 'This is a card component',
  theme: 'primary'
}])
// → <div class="card card-primary"><h3 class="card-title">Welcome</h3><div class="card-body">This is a card component</div></div>
```

### Conditional Rendering

```javascript
const showHeader = true;
const showFooter = false;
const showSidebar = null;  // null can also be used
const user = {name: 'John'};

jiccup.html(['div',
  showHeader && ['header', 'Site Header'],
  ['main', `Welcome, ${user.name}!`],
  showFooter && ['footer', 'Site Footer'],  // false is ignored
  showSidebar ? ['aside', 'Sidebar'] : null  // null is also ignored
])
// → <div><header>Site Header</header><main>Welcome, John!</main></div>
```

### Lists and Iteration

```javascript
const items = ['Apple', 'Banana', 'Orange'];

jiccup.html(['ul',
  items.map(item => ['li', item])
])
// → <ul><li>Apple</li><li>Banana</li><li>Orange</li></ul>

// With indices
jiccup.html(['ol',
  items.map((item, i) => ['li', {key: i}, `${i + 1}. ${item}`])
])
// → <ol><li key="0">1. Apple</li><li key="1">2. Banana</li><li key="2">3. Orange</li></ol>
```

### Event Handling

```javascript
const handleClick = (e) => {
  console.log('Clicked:', e.target.textContent);
};

const handleInput = (e) => {
  console.log('Input value:', e.target.value);
};

const result = jiccup.render(['div',
  ['button', {'on:click': handleClick}, 'Click me'],
  ['input', {
    'on:input': handleInput,
    'on:focus': () => console.log('Focused'),
    'on:blur': () => console.log('Blurred'),
    placeholder: 'Type something...'
  }]
]);

// Attach to DOM with event listeners
result.attach(document.getElementById('app'));
```

### Multiple Elements (Fragments)

```javascript
// Multiple elements without wrapper
jiccup.html(
  ['h1', 'Title'],
  ['p', 'First paragraph'],
  ['p', 'Second paragraph']
)
// → <h1>Title</h1><p>First paragraph</p><p>Second paragraph</p>

// Array syntax for fragments
jiccup.html([':<>',
  ['nav', 'Navigation'],
  ['main', 'Content'],
  ['footer', 'Footer']
])
// → <nav>Navigation</nav><main>Content</main><footer>Footer</footer>
```

### Raw HTML (Use with Caution)

```javascript
// Only for trusted content!
jiccup.html(['div', {
  dangerouslySetInnerHTML: '<strong>Bold</strong> and <em>italic</em> text'
}])
// → <div><strong>Bold</strong> and <em>italic</em> text</div>
```

## Security

jiccup.js automatically escapes HTML content to prevent XSS attacks:

```javascript
const userInput = '<script>alert("XSS")</script>';

jiccup.html(['div', userInput])
// → <div>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</div>

jiccup.html(['div', {title: 'User: <script>'}, 'Safe'])
// → <div title="User: &lt;script&gt;">Safe</div>
```

## Performance Features

- **Tag Parsing Cache**: Frequently used tag patterns are cached
- **Efficient Rendering**: Optimized for large element trees
- **Depth Limiting**: Prevents stack overflow with deep nesting (max 100 levels)

```javascript
// This is cached after first use
for (let i = 0; i < 1000; i++) {
  jiccup.html(['div#item.list-item', `Item ${i}`]);
}
```

## Differences from Clojure Hiccup

### Enhancements

1. **Event Handling**: Built-in event binding with `on:` prefix
2. **CSS-in-JS**: Object-style CSS with automatic camelCase conversion
3. **Function Components**: First-class component functions
4. **Performance Optimizations**: Tag caching and efficient rendering
5. **Modern JavaScript**: ES6 modules, JSDoc types, Promise support

### Syntax Differences

| Feature | Clojure Hiccup | jiccup.js |
|---------|----------------|-----------|
| Vectors | `[:div "content"]` | `['div', 'content']` |
| Keywords | `:div` | `'div'` |
| Maps | `{:class "btn"}` | `{class: 'btn'}` |

### JavaScript-Specific Features

```javascript
// Event handlers (not in Clojure version)
['button', {'on:click': handleClick}, 'Click me']

// CSS objects (enhanced syntax)
['div', {style: {backgroundColor: 'red'}}]

// Function components with destructuring
const Button = ({text, onClick}) => ['button', {'on:click': onClick}, text]
```

## Real-World Example

```javascript
// Complete application example
const TodoApp = ({todos, onToggle, onAdd}) => {
  const [newTodo, setNewTodo] = useState('');
  
  return ['div.todo-app',
    ['header.app-header',
      ['h1', 'Todo List'],
      ['form', {
        'on:submit': (e) => {
          e.preventDefault();
          onAdd(newTodo);
          setNewTodo('');
        }
      },
        ['input', {
          type: 'text',
          value: newTodo,
          'on:input': (e) => setNewTodo(e.target.value),
          placeholder: 'Add new todo...'
        }],
        ['button', {type: 'submit'}, 'Add']
      ]
    ],
    
    ['main.todo-list',
      todos.length === 0 
        ? ['p.empty-state', 'No todos yet!']
        : ['ul',
            todos.map(todo => 
              ['li', {
                class: ['todo-item', todo.completed && 'completed'],
                key: todo.id
              },
                ['input', {
                  type: 'checkbox',
                  checked: todo.completed,
                  'on:change': () => onToggle(todo.id)
                }],
                ['span.todo-text', todo.text],
                ['button.delete-btn', {
                  'on:click': () => onDelete(todo.id)
                }, '×']
              ]
            )
          ]
    ],
    
    ['footer.app-footer',
      [`${todos.filter(t => !t.completed).length} items remaining`]
    ]
  ];
};

// Render to DOM
const result = jiccup.render([TodoApp, {todos, onToggle, onAdd}]);
result.attach(document.getElementById('app'));
```

## Browser Support

- Modern browsers with ES6 module support
- Use Babel for legacy browser support


## License

MIT License 

## Changelog

### v1.2.0
- null values are now accepted like false (elements skipped, attributes omitted)
- undefined values still throw errors for bug detection
- Updated error messages to suggest using false or null instead

### v1.1.0
- Enhanced parseTag function to support flexible CSS-style selectors
- ID and classes can now be specified in any order (e.g., `div.class1#id.class2`)
- Added comprehensive unit tests for parseTag functionality
- Improved performance with caching optimizations

### v1.0.0
- Initial release
- Core HTML generation
- Event handling
- CSS-in-JS support
- Function components
- XSS protection
- Performance optimizations
