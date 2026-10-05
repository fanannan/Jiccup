/**
 * jiccup.js - Hiccup-style HTML generation library
 * 
 * A lightweight Vanilla JavaScript ES6 module for generating HTML in Clojure's Hiccup format.
 * Enables dynamic HTML generation with intuitive array-based notation.
 * 
 * ## Limitations
 * - Maximum nesting depth: 100 levels (stack overflow prevention)
 * - Tag cache size: 1000 entries (memory efficiency)
 * 
 * ## Performance Characteristics
 * - Tag patterns are cached for faster parsing on subsequent calls
 * - Be mindful of memory usage when generating large HTML structures
 * - Avoid deeply nested structures
 * 
 * ## Basic Usage
 * 
 * ### 1. Simple Tags
 * ```javascript
 * jiccup.html(['div', 'Hello World'])
 * // => '<div>Hello World</div>'
 * 
 * jiccup.html(['p', 'This is a paragraph'])
 * // => '<p>This is a paragraph</p>'
 * ```
 * 
 * ### 2. Enhanced ID and Class Shorthand Notation
 * The jiccup library supports flexible CSS-style selectors with multiple classes
 * and IDs in any order (though only one ID is allowed per tag).
 * 
 * ```javascript
 * // Basic ID and class
 * jiccup.html(['div#main', 'Content'])
 * // => '<div id="main">Content</div>'
 * 
 * jiccup.html(['div.container', 'Content'])
 * // => '<div class="container">Content</div>'
 * 
 * // Multiple classes
 * jiccup.html(['div.container.active.primary', 'Content'])
 * // => '<div class="container active primary">Content</div>'
 * 
 * // Hiccup style: ID then classes
 * jiccup.html(['div#main.container.active', 'Content'])
 * // => '<div id="main" class="container active">Content</div>'
 * 
 * // CSS style: classes then ID
 * jiccup.html(['div.container.active#main', 'Content'])
 * // => '<div id="main" class="container active">Content</div>'
 * 
 * // Mixed order: classes, ID, more classes
 * jiccup.html(['div.header#main.sticky.top', 'Content'])
 * // => '<div id="main" class="header sticky top">Content</div>'
 * 
 * // Many classes with ID (user's example)
 * jiccup.html(['div.xxx.ttt.yyyy.zzz#identifier', 'Content'])
 * // => '<div id="identifier" class="xxx ttt yyyy zzz">Content</div>'
 * ```
 * 
 * ### Invalid Formats (will throw JiccupError)
 * ```javascript
 * // Spaces not allowed
 * jiccup.html(['div .class', 'Content']) // ✗ Error
 * jiccup.html(['div# id', 'Content'])    // ✗ Error
 * 
 * // Multiple IDs not allowed  
 * jiccup.html(['div#id1#id2', 'Content']) // ✗ Error
 * 
 * // Empty selectors not allowed
 * jiccup.html(['div#', 'Content'])  // ✗ Error
 * jiccup.html(['div.', 'Content'])  // ✗ Error
 * jiccup.html(['div..class', 'Content']) // ✗ Error
 * 
 * // Invalid tag names
 * jiccup.html(['123div', 'Content'])     // ✗ Error
 * jiccup.html(['div-@#$', 'Content'])    // ✗ Error
 * ```
 * 
 * ### 3. Attribute Specification
 * ```javascript
 * jiccup.html(['a', {href: 'https://example.com', target: '_blank'}, 'Link'])
 * // => '<a href="https://example.com" target="_blank">Link</a>'
 * 
 * jiccup.html(['input', {type: 'text', value: 'Hello', disabled: true}])
 * // => '<input type="text" value="Hello" disabled>'
 * ```
 * 
 * ### 4. Nested Structures
 * ```javascript
 * jiccup.html(
 *   ['div.container',
 *     ['h1', 'Title'],
 *     ['p', 'First paragraph'],
 *     ['ul',
 *       ['li', 'Item 1'],
 *       ['li', 'Item 2']]]
 * )
 * ```
 * 
 * ### 5. Fragment (Tagless Elements)
 * ```javascript
 * // Direct notation
 * jiccup.html(
 *   [':<>',
 *     ['h1', 'Title'],
 *     ['p', 'Paragraph']]
 * )
 * // => '<h1>Title</h1><p>Paragraph</p>'
 * 
 * // Using fragment function (variadic arguments)
 * jiccup.html(
 *   jiccup.fragment(
 *     ['h1', 'Title'],
 *     ['p', 'First paragraph'],
 *     ['p', 'Second paragraph'],
 *     ['p', 'Third paragraph']
 *   )
 * )
 * // => '<h1>Title</h1><p>First paragraph</p><p>Second paragraph</p><p>Third paragraph</p>'
 * ```
 * 
 * ### 6. Function Components
 * ```javascript
 * const Card = ({title, content}) => 
 *   ['div.card',
 *     ['h3', title],
 *     ['p', content]];
 * 
 * jiccup.html([Card, {title: 'Hello', content: 'World'}])
 * // => '<div class="card"><h3>Hello</h3><p>World</p></div>'
 * ```
 * 
 * ### 7. Conditional Rendering
 * ```javascript
 * const showTitle = false;
 * jiccup.html(
 *   ['div',
 *     showTitle && ['h1', 'Title'],  // false is ignored
 *     showFooter ? ['footer', 'Footer'] : null,  // null is also ignored
 *     ['p', 'Always shown']]
 * )
 * // => '<div><p>Always shown</p></div>'
 *
 * // null is accepted (same as false), undefined will throw an error
 * // jiccup.html(['div', null]) => '<div></div>' (null is skipped)
 * // jiccup.html(['div', undefined]) => Error
 * ```
 * 
 * ### 8. Array Auto-expansion
 * ```javascript
 * const items = ['Apple', 'Banana', 'Orange'];
 * jiccup.html(
 *   ['ul',
 *     items.map(item => ['li', item])]
 * )
 * // => '<ul><li>Apple</li><li>Banana</li><li>Orange</li></ul>'
 * ```
 * 
 * ### 9. HTML Escaping (Security)
 * ```javascript
 * jiccup.html(['div', '<script>alert("XSS")</script>'])
 * // => '<div>&lt;script&gt;alert("XSS")&lt;/script&gt;</div>'
 * 
 * // For raw HTML (trusted sources only)
 * jiccup.html(['div', {dangerouslySetInnerHTML: '<b>Bold</b>'}])
 * // => '<div><b>Bold</b></div>'
 * ```
 * 
 * ### 10. Advanced Style and Class Processing
 * ```javascript
 * // Object-style styles
 * jiccup.html(['div', {
 *   style: {
 *     color: 'red',
 *     fontSize: '16px',
 *     backgroundColor: '#f0f0f0'
 *   }
 * }, 'Styled text'])
 * // => '<div style="color: red; font-size: 16px; background-color: #f0f0f0">Styled text</div>'
 * 
 * // Array-style classes
 * const isActive = true;
 * const isError = false;
 * jiccup.html(['div', {
 *   class: ['container', isActive && 'active', isError && 'error'].filter(Boolean)
 * }, 'Content'])
 * // => '<div class="container active">Content</div>'
 * ```
 * 
 * ### 11. Event Handlers (using render method)
 * ```javascript
 * // Register event handlers with on: prefix
 * const handleClick = (e) => console.log('Clicked!', e);
 * const handleHover = (e) => console.log('Hovered!', e);
 * 
 * const result = jiccup.render(
 *   ['button', {
 *     'on:click': handleClick,
 *     'on:mouseover': handleHover,
 *     class: 'btn btn-primary'
 *   }, 'Click me']
 * );
 * 
 * // Apply to DOM
 * result.attach('#app'); // or result.attach(document.getElementById('app'))
 * 
 * // For manual binding
 * document.getElementById('app').innerHTML = result.html;
 * result.bindings.forEach(binding => {
 *   const el = document.querySelector(`[data-jiccup-id="${binding.id}"]`);
 *   Object.entries(binding.events).forEach(([event, handler]) => {
 *     el.addEventListener(event, handler);
 *   });
 * });
 * ```
 * 
 * @module jiccup
 */

/**
 * 内部境界は正規ノード型へ未知の値を寄せず、処理箇所ごとの検証で絞り込む。
 * @typedef {Record<string, unknown>} JiccupRuntimeAttributes
 * @typedef {object} JiccupProcessingContext
 * @property {string[]} [path] - 診断上の要素パス。
 * @property {unknown} [parent] - 診断対象の親入力。
 * @property {number|null} [arrayIndex] - 親入力内の位置。
 * @property {unknown} [rootElement] - 診断対象の元入力。
 * @property {() => string} [nextId] - render のイベント ID 発行能力。
 * @property {ReturnType<typeof render>['bindings']} [bindings] - render の登録結果。
 */

// Configuration constants
const CONFIG = {
    MAX_DEPTH: 100,              // Maximum nesting depth
    MAX_TAG_CACHE_SIZE: 1000     // Maximum tag cache size
};

// Custom error class
class JiccupError extends Error {
    /**
     * @param {string} message - 発生内容・原因・解決方法。
     * @param {string} code - 呼出し側が識別できるエラー分類。
     * @param {Record<string, unknown>} context - 元入力を保持する診断文脈。
     */
    constructor(message, code, context = {}) {
        super(message);
        this.name = 'JiccupError';
        this.code = code;
        this.context = context;
        this.timestamp = new Date().toISOString();
    }
}

// Error code constants
const ERROR_CODES = {
    NULL_VALUE: 'NULL_VALUE',
    UNDEFINED_VALUE: 'UNDEFINED_VALUE',
    MAX_DEPTH_EXCEEDED: 'MAX_DEPTH_EXCEEDED',
    INVALID_ELEMENT: 'INVALID_ELEMENT',
    CONTAINER_NOT_FOUND: 'CONTAINER_NOT_FOUND',
    INVALID_TAG_NAME: 'INVALID_TAG_NAME'
};

// Constant definitions
/** @type {import('./types.js').JiccupConstants} */
const CONSTANTS = {
    // Special tags
    FRAGMENT: ':<>',
    
    // Attribute names
    DANGEROUS_HTML: 'dangerouslySetInnerHTML',
    CLASS: 'class',
    ID: 'id',
    STYLE: 'style',
    
    // Event prefix
    EVENT_PREFIX: 'on:',
    
    // Data attributes
    DATA_ID: 'data-jiccup-id',
    ID_PREFIX_TEMPLATE: 'jiccup-',
    
    // Selector delimiters
    ID_PREFIX: '#',
    CLASS_PREFIX: '.',
    
    // HTML tag delimiters
    TAG_OPEN: '<',
    TAG_CLOSE: '>',
    TAG_END_OPEN: '</',
    ATTR_QUOTE: '"',
    ATTR_EQUALS: '=',
    SPACE: ' ',
    EMPTY_STRING: '',
    
    // Regular expression patterns
    TAG_PATTERN: /^([^#.]+)(#[^.]*)?(\.[^#]*)?$/,
    CLASS_SEPARATOR: /\./g,
    ESCAPE_PATTERN: /[&<>"']/g,
    CAMEL_CASE_PATTERN: /([A-Z])/g,
    
    // Error messages
    // NOTE: null values are now accepted (same as false). Only undefined throws errors.
    ERROR_UNDEFINED: 'undefined values are not allowed. Use false or null instead.',
    ERROR_ATTR_UNDEFINED: (key) => `Attribute "${key}" has an undefined value. Use false or null instead.`
};

// Set of void elements (self-closing tags)
// Complete list based on HTML5 specification (includes deprecated elements for backward compatibility)
const VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
    'keygen', 'link', 'meta', 'menuitem', 'param', 'source', 'track', 'wbr'
]);

// Map for HTML escaping
/** @type {Record<string, string>} */
const ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};

// parseTag cache
/** @type {Map<string, [string, Record<string, string>]>} */
const tagCache = new Map();

/**
 * HTML escape processing
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(CONSTANTS.ESCAPE_PATTERN, char => ESCAPE_MAP[char]);
}

/**
 * Create a Fragment (tagless element group)
 * @template {unknown[]} Children
 * @param {Children} children - Child elements, in their original order
 * @returns {import('./types.js').JiccupFragment<Children>} Fragment format array
 */
function fragment(...children) {
    return [CONSTANTS.FRAGMENT, ...children];
}

/**
 * Convert style object to CSS string
 * @param {unknown} style - Style string or object
 * @returns {string} CSS string
 */
function processStyle(style) {
    if (typeof style === 'string') return style;
    
    if (typeof style === 'object' && style !== null) {
        return Object.entries(style)
            .map(([key, value]) => {
                // Convert camelCase to kebab-case
                const cssKey = key.replace(CONSTANTS.CAMEL_CASE_PATTERN, '-$1').toLowerCase();
                return `${cssKey}: ${value}`;
            })
            .join('; ');
    }
    
    return '';
}

/**
 * Convert class array to string
 * @param {unknown} className - Class string or array
 * @returns {string} Class string
 */
function processClass(className) {
    if (typeof className === 'string') return className;
    
    if (isUnknownArray(className)) {
        return className
            .filter(Boolean) // Remove null, undefined, false, ''
            .join(' ');
    }
    
    return '';
}

/**
 * Normalize arguments (single argument as-is, multiple arguments wrapped in array)
 * @param {unknown[]} args - Arguments array
 * @returns {unknown} Normalized input
 */
function normalizeInput(args) {
    return args.length === 1 ? args[0] : args;
}

/**
 * 独立ライブラリの診断境界。外部依存を追加せず、任意 throw 値の getter を一度だけ読む。
 * @param {unknown} error - 捕捉した元の原因
 * @returns {{message: string, errorType: string}} ログ向けの文字列だけを保持する診断
 */
function describeCaughtError(error) {
    let message;
    try {
        const captured = error !== null && (typeof error === 'object' || typeof error === 'function')
            && 'message' in error ? error.message : error;
        message = String(captured);
    } catch {
        message = 'エラーの診断取得に失敗しました';
    }
    let errorType;
    try {
        errorType = error !== null && (typeof error === 'object' || typeof error === 'function')
            ? String(error.constructor?.name) : typeof error;
    } catch {
        errorType = '診断取得不能';
    }
    return { message, errorType };
}

/**
 * Generate HTML string from Hiccup format array
 * 公開 export は types.d.ts の入力契約で検査し、この境界は未知の実行時入力も診断する。
 * @param {...unknown} args - Hiccup format elements
 * @returns {string} HTML string
 */
function html(...args) {
    // スタックトレース情報を収集（デバッグ用）
    const startTime = performance.now();
    const callStack = new Error().stack;

    try {
        /** @type {unknown[]} */
        const buffer = [];
        const input = normalizeInput(args);

        // 詳細ログ出力（デバッグモード時）
        if (typeof console !== 'undefined' && console.debug && jiccup.debugMode) {
            console.debug('[Jiccup] html() 呼び出し開始', {
                args,
                normalizedInput: input,
                inputType: typeof input,
                isArray: isUnknownArray(input),
                timestamp: new Date().toISOString(),
                callStack: callStack?.split('\n').slice(0, 5) // 最初の5行のみ
            });
        }

        processElement(input, buffer);
        const result = buffer.join('');

        const endTime = performance.now();
        const processingTime = endTime - startTime;

        // 詳細ログ出力（デバッグモード時）
        if (typeof console !== 'undefined' && console.debug && jiccup.debugMode) {
            console.debug('[Jiccup] html() 呼び出し完了', {
                result: result.substring(0, 200) + (result.length > 200 ? '...' : ''),
                resultLength: result.length,
                processingTime: `${processingTime.toFixed(3)}ms`,
                bufferSize: buffer.length
            });
        }

        return result;

    } catch (error) {
        const endTime = performance.now();
        const processingTime = endTime - startTime;

        // エラー時の詳細情報を追加
        if (error instanceof JiccupError) {
            // JiccupErrorの場合、呼び出し情報を追加
            error.context = {
                ...error.context,
                htmlCallInfo: {
                    args,
                    processingTime: `${processingTime.toFixed(3)}ms`,
                    originalStack: callStack,
                    timestamp: new Date().toISOString()
                }
            };
        }

        // エラーログ出力
        if (typeof console !== 'undefined' && console.error) {
            const diagnostic = describeCaughtError(error);
            console.error('[Jiccup] html() 呼び出し中にエラーが発生', {
                error: diagnostic.message,
                args,
                processingTime: `${processingTime.toFixed(3)}ms`,
                callStack: callStack?.split('\n').slice(0, 10),
                errorType: diagnostic.errorType
            });
        }

        throw error;
    }
}

/**
 * Get container element
 * @param {string|Element} container - Selector or DOM element
 * @returns {Element} DOM element
 */
function getContainer(container) {
    if (typeof container === 'string') {
        const element = document.querySelector(container);
        if (!element) {
            throw new JiccupError(
                `Container "${container}" not found`,
                ERROR_CODES.CONTAINER_NOT_FOUND,
                { selector: container }
            );
        }
        return element;
    }
    return container;
}


/**
 * Apply event bindings to elements
 * @param {Element} container - Container element
 * @param {Array<{id: string, events: Record<string, EventListener>}>} bindings - Binding information
 * @returns {void}
 */
function applyBindings(container, bindings) {
    bindings.forEach(binding => {
        const el = container.querySelector(`[${CONSTANTS.DATA_ID}="${binding.id}"]`);
        if (!el) return;
        
        Object.entries(binding.events).forEach(([event, handler]) => {
            console.log("binding events are not recommended at Jiccup generation. You have to take care of unbind them by yourself.");
            el.addEventListener(event, handler);
        });
    });
}

/**
 * Generate HTML string and event bindings from Hiccup format array
 * 公開 export は types.d.ts の HTML とイベント属性の区分を維持する。
 * @param {...unknown} args - Hiccup format elements
 * @returns {import('./types.js').JiccupRenderResult} HTML and event bindings
 */
function render(...args) {
    /** @type {unknown[]} */
    const buffer = [];
    /** @type {import('./types.js').JiccupBinding[]} */
    const bindings = [];
    let idCounter = 0;
    
    const input = normalizeInput(args);
    
    // Pass context object
    const context = {
        bindings,
        nextId: () => `${CONSTANTS.ID_PREFIX_TEMPLATE}${++idCounter}`
    };
    
    processElementWithContext(input, buffer, context);
    
    const html = buffer.join('');
    
    return {
        html,
        bindings,
        // Convenient helper method
        attach(container) {
            const element = getContainer(container);
            element.innerHTML = html;
            applyBindings(element, bindings);
            return element;
        }
    };
}

/**
 * Process element and add to buffer
 * @param {unknown} element - Element to process
 * @param {unknown[]} buffer - Buffer to accumulate HTML strings
 * @returns {void}
 */
function processElement(element, buffer) {
    const initialContext = {
        path: ['root'],
        parent: null,
        arrayIndex: null,
        rootElement: element
    };
    processElementWithContext(element, buffer, initialContext);
}

/**
 * Generate error for undefined values with comprehensive diagnostics.
 * NOTE: null values are now accepted (same as false). Only undefined throws errors.
 * @param {unknown} value - Value to check
 * @param {string} errorType - Error type ('element' or 'attribute')
 * @param {string|null} [key] - Attribute name (for attributes)
 * @param {unknown} [parentElement] - Parent element for context
 * @param {number|null} [arrayIndex] - Array index if element is in array
 * @param {string[]} [pathSegments] - 診断上の要素パス。
 * @param {unknown} [rootElement] - 元入力。
 * @returns {void}
 * @throws {JiccupError} If undefined
 */
function throwIfUndefined(value, errorType, key, parentElement, arrayIndex, pathSegments = [], rootElement = null) {
    // nullは許可される（falseと同じ扱い）。undefinedのみエラーとする。
    if (value !== undefined) return;

    // スタックトレース情報を収集
    const error = new Error();
    const stackLines = error.stack ? error.stack.split('\n') : [];

    // 呼び出し元の特定（jiccup.js以外の最初の行を探す）
    let callerInfo = null;
    for (let i = 1; i < stackLines.length; i++) {
        const line = stackLines[i];
        if (line && !line.includes('jiccup.js')) {
            const match = line.match(/at\s+([^\s]+)\s+\(([^:]+):(\d+):(\d+)\)|at\s+([^:]+):(\d+):(\d+)/);
            if (match) {
                callerInfo = {
                    function: match[1] || 'anonymous',
                    file: match[2] || match[5],
                    line: parseInt(match[3] || match[6]),
                    column: parseInt(match[4] || match[7])
                };
            }
            break;
        }
    }

    // 親要素の詳細情報を生成
    /** @type {{type?: string, isArray?: boolean, length?: number|null, firstElement?: unknown, preview?: string, error?: string}|null} */
    let parentInfo = null;
    if (parentElement) {
        try {
            parentInfo = {
                type: isUnknownArray(parentElement) ? 'array' : typeof parentElement,
                isArray: isUnknownArray(parentElement),
                length: isUnknownArray(parentElement) ? parentElement.length : null,
                firstElement: isUnknownArray(parentElement) ? parentElement[0] : null,
                preview: isUnknownArray(parentElement)
                    ? `[${parentElement.slice(0, 3).map(el =>
                        typeof el === 'string' ? `"${el.substring(0, 20)}"` :
                        isUnknownArray(el) ? '[Array]' : String(el)
                    ).join(', ')}${parentElement.length > 3 ? '...' : ''}]`
                    : String(parentElement).substring(0, 100)
            };
        } catch (e) {
            parentInfo = { error: 'Failed to analyze parent element: ' + readDiagnosticMessage(e) };
        }
    }

    // 詳細な診断情報を含むコンテキストを作成
    const diagnostics = {
        // 基本情報
        valueType: 'undefined',
        errorType,
        arrayIndex,
        key,

        // 呼び出し元情報
        caller: callerInfo,

        // 親要素情報
        parent: parentInfo,

        // 完全なスタックトレース
        fullStack: stackLines.slice(1, 10), // 最初の10行のみ

        // データ構造の詳細
        context: {
            timestamp: new Date().toISOString(),
            processDepth: stackLines.filter(line => line.includes('jiccup.js')).length,
            jiccupCallChain: stackLines
                .filter(line => line.includes('jiccup.js'))
                .map(line => {
                    const match = line.match(/at\s+([^\s]+)/);
                    return match ? match[1] : line.trim();
                })
        },

        // デバッグ用のデータダンプ
        dataDump: {
            attemptedValue: value,
            parentElementExists: !!parentElement,
            hasKey: !!key,
            hasArrayIndex: arrayIndex !== undefined,
            rootPreview: rootElement ? summarizeElement(rootElement) : undefined
        }
    };

    const isAttribute = errorType === 'attribute';
    const errorCode = ERROR_CODES.UNDEFINED_VALUE;

    // 改良されたエラーメッセージ（診断情報を含む）
    let enhancedMessage = isAttribute
        ? CONSTANTS.ERROR_ATTR_UNDEFINED(String(key))
        : CONSTANTS.ERROR_UNDEFINED;

    // 診断情報を追加
    enhancedMessage += '\n\n=== 詳細診断情報 ===';

    if (callerInfo) {
        enhancedMessage += `\n呼び出し元: ${callerInfo.function} (${callerInfo.file}:${callerInfo.line}:${callerInfo.column})`;
    }

    if (arrayIndex !== undefined) {
        enhancedMessage += `\n配列インデックス: ${arrayIndex}`;
    }

    if (parentInfo) {
        enhancedMessage += `\n親要素: ${parentInfo.type}`;
        if (parentInfo.isArray) {
            enhancedMessage += ` (長さ: ${parentInfo.length})`;
        }
        enhancedMessage += `\n親要素プレビュー: ${parentInfo.preview}`;
    }

    if (pathSegments && pathSegments.length > 0) {
        enhancedMessage += `\n要素パス: ${pathSegments.join(' > ')}`;
    }

    enhancedMessage += `\n処理の深度: ${diagnostics.context.processDepth}`;
    enhancedMessage += `\nJiccup呼び出しチェーン: ${diagnostics.context.jiccupCallChain.join(' -> ')}`;

    const context = isAttribute ? { key, value, diagnostics } : { element: value, diagnostics };

    throw new JiccupError(enhancedMessage, errorCode, context);
}

/**
 * Create a concise summary string for logging elements
 * @param {unknown} element - Element or value to summarize
 * @returns {string} summary text
 */
function summarizeElement(element) {
    try {
        if (isUnknownArray(element)) {
            const head = element[0];
            if (typeof head === 'string') {
                return `[${head} ...]`;
            }
            if (typeof head === 'function') {
                return `[component:${head.name || 'anonymous'} ...]`;
            }
            return '[array]';
        }
        if (typeof element === 'object') {
            return JSON.stringify(element).substring(0, 60);
        }
        return String(element);
    } catch (error) {
        return `unavailable(${readDiagnosticMessage(error)})`;
    }
}

/**
 * Validate element (null/undefined/false check) with detailed diagnostics
 * @param {unknown} element - Element to validate
 * @param {unknown} parentElement - Parent element for context
 * @param {number|null} [arrayIndex] - Array index if element is in array
 * @param {string[]} [pathSegments] - Array index if element is in array
 * @param {unknown} [rootElement] - Array index if element is in array
 * @returns {boolean} true if processing should continue
 * @throws {JiccupError} If undefined
 */
function validateElement(element, parentElement, arrayIndex, pathSegments, rootElement) {
    // 詳細な診断情報付きでundefinedチェックを実行（nullは許可）
    throwIfUndefined(element, 'element', null, parentElement, arrayIndex, pathSegments, rootElement);

    // falseまたはnullの場合は処理をスキップ（エラーは発生させない）
    const shouldContinue = element !== false && element !== null;

    // デバッグ情報のログ出力（開発時のみ）
    if (typeof console !== 'undefined' && console.debug && jiccup.debugMode) {
        if (!shouldContinue) {
            console.debug('[Jiccup Debug] validateElement: 要素がfalseまたはnullのため処理をスキップ', {
                element,
                parentElement: parentElement || 'N/A',
                arrayIndex: arrayIndex || 'N/A',
                elementType: typeof element,
                shouldContinue,
                stackTrace: new Error().stack
            });
        }
    }

    return shouldContinue;
}

/**
 * Process simple values (strings/numbers)
 * @param {unknown} value - Value to process
 * @param {unknown[]} buffer - Buffer to accumulate HTML strings
 * @returns {boolean} true if processed
 */
function processSimpleValue(value, buffer) {
    if (!isUnknownArray(value)) {
        buffer.push(escapeHtml(String(value)));
        return true;
    }
    return false;
}

/**
 * Process component (function)
 * @param {unknown[]} element - Element to process
 * @param {unknown[]} buffer - Buffer to accumulate HTML strings
 * @param {JiccupProcessingContext|null} context - Rendering context
 * @param {number} depth - Current nesting depth
 * @returns {boolean} true if processed
 */
function processComponent(element, buffer, context, depth) {
    const [component, ...rest] = element;
    if (!isRuntimeComponent(component)) return false;
    
    const propsCandidate = rest[0];
    const hasProps = propsCandidate && isPlainObject(propsCandidate);
    const props = hasProps ? propsCandidate : {};
    const children = hasProps ? rest.slice(1) : rest;
    
    const result = component({ ...props, children });
    processElementWithContext(result, buffer, context, depth + 1);
    return true;
}

/**
 * Extract event handlers
 * @param {JiccupRuntimeAttributes} attrs - Attributes object
 * @returns {Record<string, EventListener>} Event handler map
 */
function extractEventHandlers(attrs) {
    /** @type {Record<string, EventListener>} */
    const events = {};

    Object.keys(attrs).forEach(key => {
        if (key.startsWith(CONSTANTS.EVENT_PREFIX) && isEventHandler(attrs[key])) {
            events[key.substring(CONSTANTS.EVENT_PREFIX.length)] = attrs[key];
            delete attrs[key];
        }
    });
    
    return events;
}

/**
 * Process attributes (style, class, events)
 * @param {JiccupRuntimeAttributes} rawAttrs - Raw attributes object
 * @param {JiccupProcessingContext|null} context - Rendering context
 * @returns {{attrs: JiccupRuntimeAttributes, events: Record<string, EventListener>}} Processed attributes and events
 */
function processAttributes(rawAttrs, context) {
    const attrs = { ...rawAttrs };
    
    // Special processing for style and class
    if (CONSTANTS.STYLE in attrs) {
        attrs[CONSTANTS.STYLE] = processStyle(attrs[CONSTANTS.STYLE]);
    }
    if (CONSTANTS.CLASS in attrs) {
        attrs[CONSTANTS.CLASS] = processClass(attrs[CONSTANTS.CLASS]);
    }
    
    // Process event handlers (only if context exists)
    const events = context ? extractEventHandlers(attrs) : {};
    
    return { attrs, events };
}

/**
 * Validate attribute value
 * @param {string} key - Attribute name
 * @param {unknown} value - Attribute value
 * @returns {boolean} true if attribute should be added
 * @throws {JiccupError} If undefined
 * @param {string[]} [pathSegments] - 診断上の要素パス。
 * @param {unknown} [rootElement] - 元入力。
 */
function validateAttributeValue(key, value, pathSegments = [], rootElement = null) {
    throwIfUndefined(value, 'attribute', key, null, undefined, pathSegments, rootElement);
    return value !== false && value !== null; // Don't add attribute if false or null
}

/**
 * Append attributes to buffer
 * @param {JiccupRuntimeAttributes} attrs - Attributes object
 * @param {unknown[]} buffer - Buffer to accumulate HTML strings
 * @returns {void}
 * @param {string[]} [pathSegments] - 診断上の要素パス。
 * @param {unknown} [rootElement] - 元入力。
 */
function appendAttributes(attrs, buffer, pathSegments = [], rootElement = null) {
    for (const [key, value] of Object.entries(attrs)) {
        const attributePath = buildAttributePath(pathSegments, key);
        if (!validateAttributeValue(key, value, attributePath, rootElement)) {
            continue; // Skip if false
        }
        
        buffer.push(CONSTANTS.SPACE, key);
        
        if (value !== true) {
            // Normal attribute
            buffer.push(
                CONSTANTS.ATTR_EQUALS,
                CONSTANTS.ATTR_QUOTE,
                escapeHtml(String(value)),
                CONSTANTS.ATTR_QUOTE
            );
        }
    }
}

/**
 * @param {string[]} pathSegments - 属性を持つ要素のパス。
 * @param {string} key - 属性名。
 * @returns {string[]} 属性の診断パス。
 */
function buildAttributePath(pathSegments, key) {
    const base = isUnknownArray(pathSegments) && pathSegments.length > 0 ? pathSegments : ['root'];
    return [...base, `@${key}`];
}

/**
 * Generate opening tag and append to buffer
 * @param {string} tagName - Tag name
 * @param {JiccupRuntimeAttributes} attrs - Attributes object
 * @param {unknown[]} buffer - Buffer to accumulate HTML strings
 * @returns {void}
 * @param {string[]} [pathSegments] - 診断上の要素パス。
 * @param {unknown} [rootElement] - 元入力。
 */
function appendOpenTag(tagName, attrs, buffer, pathSegments = [], rootElement = null) {
    buffer.push(CONSTANTS.TAG_OPEN, tagName);
    
    appendAttributes(attrs, buffer, pathSegments, rootElement);
    
    buffer.push(CONSTANTS.TAG_CLOSE);
}

/**
 * Generate closing tag and append to buffer
 * @param {string} tagName - Tag name
 * @param {unknown[]} buffer - Buffer to accumulate HTML strings
 * @returns {void}
 */
function appendCloseTag(tagName, buffer) {
    buffer.push(CONSTANTS.TAG_END_OPEN, tagName, CONSTANTS.TAG_CLOSE);
}

/**
 * Process child elements
 * @param {unknown[]} children - Array of child elements
 * @param {unknown[]} buffer - Buffer to accumulate HTML strings
 * @param {JiccupProcessingContext|null} context - Rendering context
 * @param {number} depth - Current nesting depth
 * @returns {void}
 */
function processChildren(children, buffer, context, depth) {
    children.forEach((child, index) => {
        // 子要素の処理時に配列インデックス情報を含むコンテキストを作成
        const parentPath = context?.path || ['root'];
        const childContext = {
            ...(context || {}),
            parent: children,
            arrayIndex: index,
            path: buildChildPath(parentPath, child, index),
            rootElement: context?.rootElement || child
        };
        processElementWithContext(child, buffer, childContext, depth + 1);
    });
}

/**
 * @param {string[]} parentPath - 親要素のパス。
 * @param {unknown} child - 元の子入力。
 * @param {number} index - 子の位置。
 * @returns {string[]} 子の診断パス。
 */
function buildChildPath(parentPath, child, index) {
    const normalizedParent = isUnknownArray(parentPath) && parentPath.length > 0 ? parentPath : ['root'];
    return [...normalizedParent, describeElementForPath(child, index)];
}

/**
 * @param {unknown} element - 元の入力。
 * @param {number} index - 子の位置。
 * @returns {string} パス内の要素表記。
 */
function describeElementForPath(element, index) {
    if (isUnknownArray(element)) {
        const head = element[0];
        if (typeof head === 'string') {
            return `${head}[${index}]`;
        }
        if (typeof head === 'function') {
            return `component:${head.name || 'anonymous'}[${index}]`;
        }
        return `fragment[${index}]`;
    }
    if (typeof element === 'string') {
        return `text[${index}]`;
    }
    return `${typeof element}[${index}]`;
}

/**
 * Register event bindings
 * @param {Record<string, EventListener>} events - Event handler map
 * @param {JiccupRuntimeAttributes} attrs - Attributes object
 * @param {JiccupProcessingContext|null} context - Rendering context
 * @returns {void}
 */
function registerEventBindings(events, attrs, context) {
    if (Object.keys(events).length === 0) return;

    // html の診断 context は描画能力ではない。イベントを落とさず typed failure にする。
    if (!context || typeof context.nextId !== 'function' || !isUnknownArray(context.bindings)) {
        throw new JiccupError(
            'Cannot bind events with html(): this context has no event-binding capability. Use render(...).attach(container) to bind events.',
            ERROR_CODES.INVALID_ELEMENT,
            { events: Object.keys(events) }
        );
    }
    
    const id = context.nextId();
    attrs[CONSTANTS.DATA_ID] = id;
    context.bindings.push({ id, events });
}

/**
 * Process HTML tag
 * @param {[string, ...unknown[]]} element - 呼出し元で文字列先頭を検査した元の配列。
 * @param {unknown[]} buffer - Buffer to accumulate HTML strings
 * @param {JiccupProcessingContext|null} context - Rendering context
 * @param {number} depth - Current nesting depth
 * @returns {void}
 */
function processHtmlTag(element, buffer, context, depth) {
    const first = element[0];
    const [tagName, attributes] = parseTag(first);
    /** @type {JiccupRuntimeAttributes} */
    let attrs = { ...attributes };
    let childStartIndex = 1;
    
    // If second element is an attributes object
    if (element[1] && isPlainObject(element[1])) {
        const { attrs: processedAttrs, events } = processAttributes(element[1], context);
        Object.assign(attrs, processedAttrs);
        childStartIndex = 2;
        
        // Register bindings if there are events
        registerEventBindings(events, attrs, context);
    }
    
    // Process dangerouslySetInnerHTML
    const innerHTML = attrs[CONSTANTS.DANGEROUS_HTML];
    delete attrs[CONSTANTS.DANGEROUS_HTML];
    
    // Add opening tag
    appendOpenTag(tagName, attrs, buffer, context?.path, context?.rootElement);
    
    // No closing tag for void elements
    if (VOID_ELEMENTS.has(tagName)) {
        return;
    }
    
    // Process child elements
    if (innerHTML) {
        buffer.push(innerHTML);
    } else {
        const children = element.slice(childStartIndex);
        processChildren(children, buffer, context, depth);
    }
    
    // Add closing tag
    appendCloseTag(tagName, buffer);
}

/**
 * Process element and add to buffer with context
 * @param {unknown} element - Element to process
 * @param {unknown[]} buffer - Buffer to accumulate HTML strings
 * @param {JiccupProcessingContext|null} context - Rendering context (optional)
 * @param {number} depth - Current nesting depth (default: 0)
 * @returns {void}
 * @throws {JiccupError} If maximum nesting depth exceeded
 */
function processElementWithContext(element, buffer, context = null, depth = 0) {
    // Check maximum nesting depth
    if (depth > CONFIG.MAX_DEPTH) {
        throw new JiccupError(
            `Maximum nesting depth ${CONFIG.MAX_DEPTH} exceeded`,
            ERROR_CODES.MAX_DEPTH_EXCEEDED,
            { depth, maxDepth: CONFIG.MAX_DEPTH }
        );
    }
    
    // Validate element with enhanced diagnostics
    const effectiveContext = context || {
        path: ['root'],
        parent: null,
        arrayIndex: null,
        rootElement: element
    };
    
    if (!validateElement(element, effectiveContext.parent, effectiveContext.arrayIndex, effectiveContext.path, effectiveContext.rootElement)) {
        return; // Ignore if false
    }
    
    // Process simple values
    if (processSimpleValue(element, buffer)) {
        return;
    }
    
    // Ignore empty arrays
    if (!isUnknownArray(element) || element.length === 0) {
        return;
    }
    
    // Process components
    if (processComponent(element, buffer, effectiveContext, depth)) {
        return;
    }
    
    const first = element[0];
    
    // If first element is not a string, process as array auto-expansion
    if (!hasStringHead(element, first)) {
        processChildren(element, buffer, effectiveContext, depth);
        return;
    }
    
    // Process Fragment
    if (first === CONSTANTS.FRAGMENT) {
        const children = element.slice(1);
        processChildren(children, buffer, effectiveContext, depth);
        return;
    }
    
    // Process normal tag
    processHtmlTag(element, buffer, effectiveContext, depth);
}

/**
 * Get tag information from cache
 * @param {string} tag - Tag string
 * @returns {[string, Record<string, string>]|null} Cached result or null
 */
function getCachedTag(tag) {
    if (!tagCache.has(tag)) return null;
    const cached = tagCache.get(tag);
    // 存在する破損 entry を cache miss として再生成し、失敗を隠さない。
    if (cached === undefined) {
        throw new TypeError(`Cached tag "${tag}" has no value although the entry exists. Remove the corrupted cache entry before retrying.`);
    }
    return [cached[0], { ...cached[1] }];
}

/**
 * Save tag information to cache
 * @param {string} tag - Tag string
 * @param {string} tagName - Tag name
 * @param {Record<string, string>} attrs - Attributes object
 * @returns {void}
 */
function setCachedTag(tag, tagName, attrs) {
    if (tagCache.size >= CONFIG.MAX_TAG_CACHE_SIZE) {
        const firstEntry = tagCache.keys().next();
        if (!firstEntry.done) tagCache.delete(firstEntry.value);
    }
    tagCache.set(tag, [tagName, attrs]);
}

/**
 * Validate tag name
 * @param {string} tagName - Tag name to validate
 * @returns {void}
 * @throws {JiccupError} If invalid tag name
 */
function validateTagName(tagName) {
    // HTML injection prevention
    if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(tagName)) {
        throw new JiccupError(
            `Invalid tag name: "${tagName}"`,
            ERROR_CODES.INVALID_TAG_NAME,
            { tagName }
        );
    }
}

/**
 * Parse tag string and split into tag name and attributes
 * Supports flexible CSS-style selectors with classes and ID in any order
 * @param {string} tag - Tag string (e.g., "div#id.class1.class2" or "div.class1.class2#id")
 * @returns {[string, Record<string, string>]} [tag name, attributes object]
 * @throws {JiccupError} If invalid format, multiple IDs, or spaces in tag
 */
function parseTag(tag) {
    // Check cache first
    const cached = getCachedTag(tag);
    if (cached) return cached;
    
    // Validate no spaces (invalid in tag selectors)
    if (/\s/.test(tag)) {
        throw new JiccupError(
            `Invalid tag format - spaces not allowed: "${tag}"`,
            ERROR_CODES.INVALID_TAG_NAME,
            { tag }
        );
    }
    
    // Extract tag name (everything before first # or .)
    const tagMatch = tag.match(/^([^#.]+)/);
    if (!tagMatch) {
        throw new JiccupError(
            `Invalid tag format: "${tag}"`,
            ERROR_CODES.INVALID_TAG_NAME,
            { tag }
        );
    }
    
    const tagName = tagMatch[1];
    validateTagName(tagName);
    
    // Extract all selector parts (# and . segments)
    const remaining = tag.substring(tagName.length);
    
    // Match # or . followed by non-# non-. characters
    const selectorParts = remaining.match(/(#[^#.]+|\.[^#.]+)/g) || [];
    
    // Validate that we consumed the entire string
    const consumed = tagName + selectorParts.join('');
    if (consumed !== tag) {
        throw new JiccupError(
            `Invalid tag format: "${tag}"`,
            ERROR_CODES.INVALID_TAG_NAME,
            { tag, issue: 'unparseable characters' }
        );
    }
    
    /** @type {Record<string, string>} */
    const attrs = {};
    /** @type {string[]} */
    const classes = [];
    let hasId = false;

    for (const part of selectorParts) {
        if (part.startsWith('#')) {
            if (hasId) {
                throw new JiccupError(
                    `Multiple IDs not allowed: "${tag}"`,
                    ERROR_CODES.INVALID_TAG_NAME,
                    { tag, duplicate: part }
                );
            }
            const idValue = part.substring(1);
            if (!idValue) {
                throw new JiccupError(
                    `Empty ID not allowed: "${tag}"`,
                    ERROR_CODES.INVALID_TAG_NAME,
                    { tag }
                );
            }
            attrs[CONSTANTS.ID] = idValue;
            hasId = true;
        } else if (part.startsWith('.')) {
            const className = part.substring(1);
            if (!className) {
                throw new JiccupError(
                    `Empty class not allowed: "${tag}"`,
                    ERROR_CODES.INVALID_TAG_NAME,
                    { tag }
                );
            }
            classes.push(className);
        }
    }
    
    if (classes.length > 0) {
        attrs[CONSTANTS.CLASS] = classes.join(' ');
    }
    
    setCachedTag(tag, tagName, attrs);
    return [tagName, attrs];
}



/**
 * property 読取と同じ boxing を行い、診断用 message を一度だけ読む。
 * 任意 throw 値の constructor は読まず、nullish 値の読取失敗も維持する。
 * @param {unknown} error - 診断作成中に捕捉した値。
 * @returns {unknown} 元の message 値。
 */
function readDiagnosticMessage(error) {
    if (error === null || error === undefined) {
        throw new TypeError(`Cannot read properties of ${error} (reading 'message')`);
    }
    /** @type {object} */
    const boxed = Object(error);
    /** @type {unknown} */
    const message = Reflect.get(boxed, 'message', error);
    return message;
}

/**
 * 先に読んだ head の判定を tuple の構造へ接続し、getter を追加で読まない。
 * @param {unknown[]} element - 検査対象の元配列。
 * @param {unknown} head - 呼出し元が読んだ先頭値。
 * @returns {element is [string, ...unknown[]]} 文字列先頭か。
 */
function hasStringHead(element, head) {
    return typeof head === 'string';
}

/**
 * Array.isArray の実行時判定を保持し、境界内の各要素を unknown として扱う。
 * @param {unknown} value - 未検証の入力。
 * @returns {value is unknown[]} 配列であるか。
 */
function isUnknownArray(value) {
    return Array.isArray(value);
}

/**
 * component を呼ぶ前に関数であることを確かめ、戻値を再検証へ渡す。
 * @param {unknown} value - component 候補。
 * @returns {value is (props: JiccupRuntimeAttributes & {children: unknown[]}) => unknown} 呼出し可能か。
 */
function isRuntimeComponent(value) {
    return typeof value === 'function';
}

/**
 * render は既存の関数 handler を DOM に渡す。引数・戻値を共通 Function に消去しない。
 * @param {unknown} value - handler 候補。
 * @returns {value is EventListener} 関数 handler か。
 */
function isEventHandler(value) {
    return typeof value === 'function';
}

/**
 * Check if plain object
 * @param {unknown} obj - Object to check
 * @returns {obj is JiccupRuntimeAttributes} true if plain object
 */
function isPlainObject(obj) {
    return obj !== null &&
           typeof obj === 'object' && 
           obj.constructor === Object;
}

// Create Hiccup object
/** @type {import('./types.js').JiccupApi} */
const jiccup = {
    html,
    render,
    fragment,
    escapeHtml,

    // デバッグ機能
    debugMode: false,

    // デバッグモード制御
    /** @returns {import('./types.js').JiccupApi} デバッグを有効にした同じ API。 */
    enableDebugMode() {
        this.debugMode = true;
        if (typeof console !== 'undefined' && console.info) {
            console.info('[Jiccup] デバッグモードが有効になりました。詳細なログとエラー診断が表示されます。');
        }
        return this;
    },

    /** @returns {import('./types.js').JiccupApi} デバッグを無効にした同じ API。 */
    disableDebugMode() {
        this.debugMode = false;
        if (typeof console !== 'undefined' && console.info) {
            console.info('[Jiccup] デバッグモードが無効になりました。');
        }
        return this;
    },

    // デバッグ情報取得
    /** @returns {import('./types.js').JiccupDebugInfo} 現在の診断情報。 */
    getDebugInfo() {
        return {
            debugMode: this.debugMode,
            version: '1.0.0',
            cacheSize: tagCache.size,
            constants: CONSTANTS,
            performance: {
                tagCacheEnabled: true,
                maxNestingDepth: 100,
                maxCacheSize: 1000
            }
        };
    },

    // エラー報告機能
    /**
     * 診断対象と呼出し側の文脈を報告する。生成できない場合は既存の null 結果を返す。
     * @param {unknown} element - 診断対象。
     * @param {Record<string, unknown>} context - 呼出し側が保持する診断文脈。
     * @returns {import('./types.js').JiccupErrorReport|null} 報告、または生成失敗。
     */
    reportError(element, context = {}) {
        try {
            const error = new Error();
            const callStack = error.stack;

            const report = {
                timestamp: new Date().toISOString(),
                element,
                context,
                debugMode: this.debugMode,
                callStack: callStack?.split('\n').slice(0, 10),
                systemInfo: {
                    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
                    platform: typeof navigator !== 'undefined' ? navigator.platform : 'N/A'
                }
            };

            if (typeof console !== 'undefined' && console.warn) {
                console.warn('[Jiccup] エラー報告:', report);
            }

            return report;
        } catch (e) {
            if (typeof console !== 'undefined' && console.error) {
                console.error('[Jiccup] エラー報告の生成に失敗:', e);
            }
            return null;
        }
    },

    // Cleanup utility
    /**
     * 対象 container の内容を除去する。container の解決は attach と同じ境界を使う。
     * @param {string|Element} container - Selector または DOM element。
     * @returns {Element} 内容を除去した同じ container。
     */
    cleanup(container) {
        const element = getContainer(container);
        element.innerHTML = ''; // This also removes existing event listeners
        return element;
    },

    // Also export constants (use as needed)
    CONSTANTS
};

// ES6 module export
export { jiccup };

// Test exports (only available when explicitly importing for tests)
// These exports are used by unit tests to access internal functions
export const __testExports = {
    parseTag,
    JiccupError,
    ERROR_CODES,
    CONSTANTS,
    validateTagName,
    getCachedTag,
    setCachedTag,
    tagCache
};
