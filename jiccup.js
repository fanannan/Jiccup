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
 * ### 2. ID and Class Shorthand Notation
 * ```javascript
 * jiccup.html(['div#main', 'Content'])
 * // => '<div id="main">Content</div>'
 * 
 * jiccup.html(['div.container', 'Content'])
 * // => '<div class="container">Content</div>'
 * 
 * jiccup.html(['div#main.container.active', 'Content'])
 * // => '<div id="main" class="container active">Content</div>'
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
 *     ['p', 'Always shown']]
 * )
 * // => '<div><p>Always shown</p></div>'
 * 
 * // null/undefined will throw an error
 * // jiccup.html(['div', null]) => Error
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

// Configuration constants
const CONFIG = {
    MAX_DEPTH: 100,              // Maximum nesting depth
    MAX_TAG_CACHE_SIZE: 1000     // Maximum tag cache size
};

// Custom error class
class JiccupError extends Error {
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
    ERROR_NULL: 'null values are not allowed. Use false instead.',
    ERROR_UNDEFINED: 'undefined values are not allowed. Use false instead.',
    ERROR_ATTR_NULL: (key) => `Attribute "${key}" has a null value. Use false instead.`,
    ERROR_ATTR_UNDEFINED: (key) => `Attribute "${key}" has an undefined value. Use false instead.`
};

// Set of void elements (self-closing tags)
// Complete list based on HTML5 specification (includes deprecated elements for backward compatibility)
const VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
    'keygen', 'link', 'meta', 'menuitem', 'param', 'source', 'track', 'wbr'
]);

// Map for HTML escaping
const ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};

// parseTag cache
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
 * @param {...any} children - Child elements
 * @returns {Array<any>} Fragment format array
 */
function fragment(...children) {
    return [CONSTANTS.FRAGMENT, ...children];
}

/**
 * Convert style object to CSS string
 * @param {string|Object<string, string>} style - Style string or object
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
 * @param {string|Array<string>} className - Class string or array
 * @returns {string} Class string
 */
function processClass(className) {
    if (typeof className === 'string') return className;
    
    if (Array.isArray(className)) {
        return className
            .filter(Boolean) // Remove null, undefined, false, ''
            .join(' ');
    }
    
    return '';
}

/**
 * Normalize arguments (single argument as-is, multiple arguments wrapped in array)
 * @param {Array<any>} args - Arguments array
 * @returns {any} Normalized input
 */
function normalizeInput(args) {
    return args.length === 1 ? args[0] : args;
}

/**
 * Generate HTML string from Hiccup format array
 * @param {...any} args - Hiccup format elements
 * @returns {string} HTML string
 */
function html(...args) {
    const buffer = [];
    const input = normalizeInput(args);
    
    processElement(input, buffer);
    return buffer.join('');
}

/**
 * Get container element
 * @param {string|HTMLElement} container - Selector or DOM element
 * @returns {HTMLElement} DOM element
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
 * @param {HTMLElement} container - Container element
 * @param {Array<{id: string, events: Object<string, Function>}>} bindings - Binding information
 * @returns {void}
 */
function applyBindings(container, bindings) {
    bindings.forEach(binding => {
        const el = container.querySelector(`[${CONSTANTS.DATA_ID}="${binding.id}"]`);
        if (!el) return;
        
        Object.entries(binding.events).forEach(([event, handler]) => {
            el.addEventListener(event, handler);
        });
    });
}

/**
 * Generate HTML string and event bindings from Hiccup format array
 * @param {...any} args - Hiccup format elements
 * @returns {{html: string, bindings: Array<{id: string, events: Object<string, Function>}>, attach: Function}} HTML and event bindings
 */
function render(...args) {
    const buffer = [];
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
 * @param {any} element - Element to process
 * @param {Array<string>} buffer - Buffer to accumulate HTML strings
 * @returns {void}
 */
function processElement(element, buffer) {
    processElementWithContext(element, buffer, null);
}

/**
 * Generate error for null/undefined values
 * @param {any} value - Value to check
 * @param {string} errorType - Error type ('element' or 'attribute')
 * @param {string} [key] - Attribute name (for attributes)
 * @returns {void}
 * @throws {JiccupError} If null/undefined
 */
function throwIfNullOrUndefined(value, errorType, key) {
    const isNull = value === null;
    const isUndefined = value === undefined;
    
    if (!isNull && !isUndefined) return;
    
    const isAttribute = errorType === 'attribute';
    const errorCode = isNull ? ERROR_CODES.NULL_VALUE : ERROR_CODES.UNDEFINED_VALUE;
    const message = isAttribute
        ? (isNull ? CONSTANTS.ERROR_ATTR_NULL(key) : CONSTANTS.ERROR_ATTR_UNDEFINED(key))
        : (isNull ? CONSTANTS.ERROR_NULL : CONSTANTS.ERROR_UNDEFINED);
    const context = isAttribute ? { key, value } : { element: value };
    
    throw new JiccupError(message, errorCode, context);
}

/**
 * Validate element (null/undefined/false check)
 * @param {any} element - Element to validate
 * @returns {boolean} true if processing should continue
 * @throws {JiccupError} If null/undefined
 */
function validateElement(element) {
    throwIfNullOrUndefined(element, 'element');
    return element !== false;
}

/**
 * Process simple values (strings/numbers)
 * @param {any} value - Value to process
 * @param {Array<string>} buffer - Buffer to accumulate HTML strings
 * @returns {boolean} true if processed
 */
function processSimpleValue(value, buffer) {
    if (!Array.isArray(value)) {
        buffer.push(escapeHtml(String(value)));
        return true;
    }
    return false;
}

/**
 * Process component (function)
 * @param {Array<any>} element - Element to process
 * @param {Array<string>} buffer - Buffer to accumulate HTML strings
 * @param {Object|null} context - Rendering context
 * @param {number} depth - Current nesting depth
 * @returns {boolean} true if processed
 */
function processComponent(element, buffer, context, depth) {
    const [component, ...rest] = element;
    if (typeof component !== 'function') return false;
    
    const hasProps = rest[0] && isPlainObject(rest[0]);
    const props = hasProps ? rest[0] : {};
    const children = hasProps ? rest.slice(1) : rest;
    
    const result = component({ ...props, children });
    processElementWithContext(result, buffer, context, depth + 1);
    return true;
}

/**
 * Extract event handlers
 * @param {Object<string, any>} attrs - Attributes object
 * @returns {Object<string, Function>} Event handler map
 */
function extractEventHandlers(attrs) {
    const events = {};
    
    Object.keys(attrs).forEach(key => {
        if (key.startsWith(CONSTANTS.EVENT_PREFIX) && typeof attrs[key] === 'function') {
            events[key.substring(CONSTANTS.EVENT_PREFIX.length)] = attrs[key];
            delete attrs[key];
        }
    });
    
    return events;
}

/**
 * Process attributes (style, class, events)
 * @param {Object<string, any>} rawAttrs - Raw attributes object
 * @param {Object|null} context - Rendering context
 * @returns {{attrs: Object<string, any>, events: Object<string, Function>}} Processed attributes and events
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
 * @param {any} value - Attribute value
 * @returns {boolean} true if attribute should be added
 * @throws {JiccupError} If null/undefined
 */
function validateAttributeValue(key, value) {
    throwIfNullOrUndefined(value, 'attribute', key);
    return value !== false; // Don't add attribute if false
}

/**
 * Append attributes to buffer
 * @param {Object<string, any>} attrs - Attributes object
 * @param {Array<string>} buffer - Buffer to accumulate HTML strings
 * @returns {void}
 */
function appendAttributes(attrs, buffer) {
    for (const [key, value] of Object.entries(attrs)) {
        if (!validateAttributeValue(key, value)) {
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
 * Generate opening tag and append to buffer
 * @param {string} tagName - Tag name
 * @param {Object<string, any>} attrs - Attributes object
 * @param {Array<string>} buffer - Buffer to accumulate HTML strings
 * @returns {void}
 */
function appendOpenTag(tagName, attrs, buffer) {
    buffer.push(CONSTANTS.TAG_OPEN, tagName);
    
    appendAttributes(attrs, buffer);
    
    buffer.push(CONSTANTS.TAG_CLOSE);
}

/**
 * Generate closing tag and append to buffer
 * @param {string} tagName - Tag name
 * @param {Array<string>} buffer - Buffer to accumulate HTML strings
 * @returns {void}
 */
function appendCloseTag(tagName, buffer) {
    buffer.push(CONSTANTS.TAG_END_OPEN, tagName, CONSTANTS.TAG_CLOSE);
}

/**
 * Process child elements
 * @param {Array<any>} children - Array of child elements
 * @param {Array<string>} buffer - Buffer to accumulate HTML strings
 * @param {Object|null} context - Rendering context
 * @param {number} depth - Current nesting depth
 * @returns {void}
 */
function processChildren(children, buffer, context, depth) {
    children.forEach(child => processElementWithContext(child, buffer, context, depth + 1));
}

/**
 * Register event bindings
 * @param {Object<string, Function>} events - Event handler map
 * @param {Object<string, any>} attrs - Attributes object
 * @param {Object|null} context - Rendering context
 * @returns {void}
 */
function registerEventBindings(events, attrs, context) {
    if (!context || Object.keys(events).length === 0) return;
    
    const id = context.nextId();
    attrs[CONSTANTS.DATA_ID] = id;
    context.bindings.push({ id, events });
}

/**
 * Process HTML tag
 * @param {Array<any>} element - Hiccup format element
 * @param {Array<string>} buffer - Buffer to accumulate HTML strings
 * @param {Object|null} context - Rendering context
 * @param {number} depth - Current nesting depth
 * @returns {void}
 */
function processHtmlTag(element, buffer, context, depth) {
    const first = element[0];
    const [tagName, attributes] = parseTag(first);
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
    appendOpenTag(tagName, attrs, buffer);
    
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
 * @param {any} element - Element to process
 * @param {Array<string>} buffer - Buffer to accumulate HTML strings
 * @param {Object|null} context - Rendering context (optional)
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
    
    // Validate element
    if (!validateElement(element)) {
        return; // Ignore if false
    }
    
    // Process simple values
    if (processSimpleValue(element, buffer)) {
        return;
    }
    
    // Ignore empty arrays
    if (!Array.isArray(element) || element.length === 0) {
        return;
    }
    
    // Process components
    if (processComponent(element, buffer, context, depth)) {
        return;
    }
    
    const first = element[0];
    
    // If first element is not a string, process as array auto-expansion
    if (typeof first !== 'string') {
        processChildren(element, buffer, context, depth);
        return;
    }
    
    // Process Fragment
    if (first === CONSTANTS.FRAGMENT) {
        const children = element.slice(1);
        processChildren(children, buffer, context, depth);
        return;
    }
    
    // Process normal tag
    processHtmlTag(element, buffer, context, depth);
}

/**
 * Get tag information from cache
 * @param {string} tag - Tag string
 * @returns {[string, Object<string, string>]|null} Cached result or null
 */
function getCachedTag(tag) {
    if (!tagCache.has(tag)) return null;
    const cached = tagCache.get(tag);
    return [cached[0], { ...cached[1] }];
}

/**
 * Save tag information to cache
 * @param {string} tag - Tag string
 * @param {string} tagName - Tag name
 * @param {Object<string, string>} attrs - Attributes object
 * @returns {void}
 */
function setCachedTag(tag, tagName, attrs) {
    if (tagCache.size >= CONFIG.MAX_TAG_CACHE_SIZE) {
        const firstKey = tagCache.keys().next().value;
        tagCache.delete(firstKey);
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
 * @param {string} tag - Tag string (e.g., "div#id.class1.class2")
 * @returns {[string, Object<string, string>]} [tag name, attributes object]
 */
function parseTag(tag) {
    // Check cache
    const cached = getCachedTag(tag);
    if (cached) return cached;
    
    const match = tag.match(CONSTANTS.TAG_PATTERN);
    if (!match) {
        validateTagName(tag); // Validate tag name
        setCachedTag(tag, tag, {});
        return [tag, {}];
    }
    
    const tagName = match[1];
    validateTagName(tagName); // Validate tag name
    
    const attrs = {};
    
    // Process ID and class in one line
    if (match[2]) attrs[CONSTANTS.ID] = match[2].substring(1);
    if (match[3]) attrs[CONSTANTS.CLASS] = match[3].substring(1).replace(CONSTANTS.CLASS_SEPARATOR, CONSTANTS.SPACE);
    
    setCachedTag(tag, tagName, attrs);
    return [tagName, attrs];
}



/**
 * Check if plain object
 * @param {any} obj - Object to check
 * @returns {boolean} true if plain object
 */
function isPlainObject(obj) {
    return obj != null && 
           typeof obj === 'object' && 
           obj.constructor === Object;
}

// Create Hiccup object
const jiccup = {
    html,
    render,
    fragment,
    escapeHtml,
    
    // Cleanup utility
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
