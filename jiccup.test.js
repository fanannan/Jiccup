/**
 * Comprehensive unit tests for jiccup.js
 * Focuses on main API functions: html(), render(), and fragment()
 * Tests various inputs, outputs, and edge cases
 */

import { jiccup } from './jiccup.js';

// Test utilities
const isNode = typeof window === 'undefined';
const test = (description, fn) => {
    try {
        fn();
        console.log(`✓ ${description}`);
    } catch (error) {
        console.error(`✗ ${description}`);
        console.error(`  ${error.message}`);
        throw error;
    }
};

const testDOM = (description, fn) => {
    if (isNode) {
        console.log(`⚠ ${description} (skipped in Node.js)`);
        return;
    }
    test(description, fn);
};

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
};

const assertEquals = (actual, expected, message) => {
    if (actual !== expected) {
        throw new Error(message || `Expected "${expected}" but got "${actual}"`);
    }
};

const assertThrows = (fn, expectedError, message) => {
    let thrown = false;
    let actualError;
    try {
        fn();
    } catch (error) {
        thrown = true;
        actualError = error;
    }
    if (!thrown) {
        throw new Error(message || 'Expected function to throw');
    }
    if (expectedError && (!actualError.message.includes(expectedError) && !actualError.code?.includes(expectedError))) {
        throw new Error(`Expected error containing "${expectedError}" but got "${actualError.message}"`);
    }
};

// Test suite
console.log('Running jiccup.js unit tests...\n');

// ============================================================================
// jiccup.html() tests - Basic functionality
// ============================================================================
console.log('=== jiccup.html() - Basic functionality ===');

test('Simple tag with text', () => {
    assertEquals(
        jiccup.html(['div', 'Hello']),
        '<div>Hello</div>'
    );
});

test('Empty tag', () => {
    assertEquals(
        jiccup.html(['div']),
        '<div></div>'
    );
});

test('Tag with empty string', () => {
    assertEquals(
        jiccup.html(['div', '']),
        '<div></div>'
    );
});

test('Multiple text children', () => {
    assertEquals(
        jiccup.html(['div', 'Hello', ' ', 'World']),
        '<div>Hello World</div>'
    );
});

test('Nested tags', () => {
    assertEquals(
        jiccup.html(['div', ['span', 'Nested']]),
        '<div><span>Nested</span></div>'
    );
});

test('Deep nesting', () => {
    assertEquals(
        jiccup.html(['div', ['p', ['span', ['strong', 'Deep']]]]),
        '<div><p><span><strong>Deep</strong></span></p></div>'
    );
});

// ============================================================================
// jiccup.html() tests - ID and class shorthand
// ============================================================================
console.log('\n=== jiccup.html() - ID and class shorthand ===');

test('ID shorthand', () => {
    assertEquals(
        jiccup.html(['div#main', 'Content']),
        '<div id="main">Content</div>'
    );
});

test('Class shorthand', () => {
    assertEquals(
        jiccup.html(['div.container', 'Content']),
        '<div class="container">Content</div>'
    );
});

test('Multiple classes shorthand', () => {
    assertEquals(
        jiccup.html(['div.container.active.large', 'Content']),
        '<div class="container active large">Content</div>'
    );
});

test('ID and classes combined', () => {
    assertEquals(
        jiccup.html(['div#main.container.active', 'Content']),
        '<div id="main" class="container active">Content</div>'
    );
});

test('Tag without content but with ID/class', () => {
    assertEquals(
        jiccup.html(['div#empty.class']),
        '<div id="empty" class="class"></div>'
    );
});

// ============================================================================
// jiccup.html() tests - Attributes
// ============================================================================
console.log('\n=== jiccup.html() - Attributes ===');

test('Basic attributes', () => {
    assertEquals(
        jiccup.html(['a', {href: 'https://example.com', target: '_blank'}, 'Link']),
        '<a href="https://example.com" target="_blank">Link</a>'
    );
});

test('Boolean attributes - true', () => {
    assertEquals(
        jiccup.html(['input', {type: 'checkbox', checked: true}]),
        '<input type="checkbox" checked>'
    );
});

test('Boolean attributes - false (omitted)', () => {
    assertEquals(
        jiccup.html(['input', {type: 'checkbox', checked: false}]),
        '<input type="checkbox">'
    );
});

test('Attributes with special characters', () => {
    assertEquals(
        jiccup.html(['div', {title: 'Special: & < > " \'', 'data-value': '123'}, 'Content']),
        '<div title="Special: &amp; &lt; &gt; &quot; &#39;" data-value="123">Content</div>'
    );
});

test('Empty attributes object', () => {
    assertEquals(
        jiccup.html(['div', {}, 'Content']),
        '<div>Content</div>'
    );
});

test('Numeric attribute values', () => {
    assertEquals(
        jiccup.html(['div', {width: 100, height: 200}, 'Box']),
        '<div width="100" height="200">Box</div>'
    );
});

// ============================================================================
// jiccup.html() tests - Void elements
// ============================================================================
console.log('\n=== jiccup.html() - Void elements ===');

test('br tag', () => {
    assertEquals(
        jiccup.html(['br']),
        '<br>'
    );
});

test('hr tag', () => {
    assertEquals(
        jiccup.html(['hr']),
        '<hr>'
    );
});

test('img tag with attributes', () => {
    assertEquals(
        jiccup.html(['img', {src: 'image.png', alt: 'Test'}]),
        '<img src="image.png" alt="Test">'
    );
});

test('input tag', () => {
    assertEquals(
        jiccup.html(['input', {type: 'text', value: 'Hello'}]),
        '<input type="text" value="Hello">'
    );
});

test('Void element with children (children ignored)', () => {
    assertEquals(
        jiccup.html(['br', 'This should be ignored']),
        '<br>'
    );
});

// ============================================================================
// jiccup.html() tests - Fragments
// ============================================================================
console.log('\n=== jiccup.html() - Fragments ===');

test('Fragment with array notation', () => {
    assertEquals(
        jiccup.html([':<>', ['h1', 'Title'], ['p', 'Paragraph']]),
        '<h1>Title</h1><p>Paragraph</p>'
    );
});

test('Fragment function', () => {
    assertEquals(
        jiccup.html(jiccup.fragment(['h1', 'Title'], ['p', 'Paragraph'])),
        '<h1>Title</h1><p>Paragraph</p>'
    );
});

test('Nested fragments', () => {
    assertEquals(
        jiccup.html(['div', [':<>', ['span', 'A'], ['span', 'B']]]),
        '<div><span>A</span><span>B</span></div>'
    );
});

test('Empty fragment', () => {
    assertEquals(
        jiccup.html([':<>']),
        ''
    );
});

// ============================================================================
// jiccup.html() tests - Arrays and conditionals
// ============================================================================
console.log('\n=== jiccup.html() - Arrays and conditionals ===');

test('Array of elements', () => {
    assertEquals(
        jiccup.html(['ul', [['li', 'A'], ['li', 'B'], ['li', 'C']]]),
        '<ul><li>A</li><li>B</li><li>C</li></ul>'
    );
});

test('Mapped array', () => {
    const items = ['Apple', 'Banana'];
    assertEquals(
        jiccup.html(['ul', items.map(item => ['li', item])]),
        '<ul><li>Apple</li><li>Banana</li></ul>'
    );
});

test('Conditional rendering - false is ignored', () => {
    assertEquals(
        jiccup.html(['div', false && ['span', 'Hidden'], ['span', 'Visible']]),
        '<div><span>Visible</span></div>'
    );
});

test('Mixed conditionals', () => {
    const show1 = true;
    const show2 = false;
    assertEquals(
        jiccup.html(['div', 
            show1 && ['p', 'Shown'],
            show2 && ['p', 'Hidden'],
            ['p', 'Always']
        ]),
        '<div><p>Shown</p><p>Always</p></div>'
    );
});

// ============================================================================
// jiccup.html() tests - Function components
// ============================================================================
console.log('\n=== jiccup.html() - Function components ===');

test('Simple function component', () => {
    const Button = ({text}) => ['button', text];
    assertEquals(
        jiccup.html([Button, {text: 'Click me'}]),
        '<button>Click me</button>'
    );
});

test('Function component with children', () => {
    const Container = ({children}) => ['div.container', ...children];
    assertEquals(
        jiccup.html([Container, {}, ['p', 'Child 1'], ['p', 'Child 2']]),
        '<div class="container"><p>Child 1</p><p>Child 2</p></div>'
    );
});

test('Nested function components', () => {
    const Card = ({title, content}) => ['div.card', ['h3', title], ['p', content]];
    const App = () => ['div', [Card, {title: 'Hello', content: 'World'}]];
    assertEquals(
        jiccup.html([App]),
        '<div><div class="card"><h3>Hello</h3><p>World</p></div></div>'
    );
});

// ============================================================================
// jiccup.html() tests - Style and class processing
// ============================================================================
console.log('\n=== jiccup.html() - Style and class processing ===');

test('Object style', () => {
    assertEquals(
        jiccup.html(['div', {style: {color: 'red', fontSize: '16px'}}, 'Styled']),
        '<div style="color: red; font-size: 16px">Styled</div>'
    );
});

test('String style', () => {
    assertEquals(
        jiccup.html(['div', {style: 'color: blue; margin: 10px'}, 'Styled']),
        '<div style="color: blue; margin: 10px">Styled</div>'
    );
});

test('Array classes', () => {
    assertEquals(
        jiccup.html(['div', {class: ['btn', 'btn-primary', 'active']}, 'Button']),
        '<div class="btn btn-primary active">Button</div>'
    );
});

test('Array classes with conditionals', () => {
    assertEquals(
        jiccup.html(['div', {class: ['btn', false && 'hidden', 'active'].filter(Boolean)}, 'Button']),
        '<div class="btn active">Button</div>'
    );
});

test('CamelCase to kebab-case style conversion', () => {
    assertEquals(
        jiccup.html(['div', {style: {backgroundColor: '#f0f0f0', marginTop: '10px'}}, 'Styled']),
        '<div style="background-color: #f0f0f0; margin-top: 10px">Styled</div>'
    );
});

// ============================================================================
// jiccup.html() tests - Special features
// ============================================================================
console.log('\n=== jiccup.html() - Special features ===');

test('dangerouslySetInnerHTML', () => {
    assertEquals(
        jiccup.html(['div', {dangerouslySetInnerHTML: '<b>Bold</b> text'}]),
        '<div><b>Bold</b> text</div>'
    );
});

test('HTML escaping', () => {
    assertEquals(
        jiccup.html(['div', '<script>alert("XSS")</script>']),
        '<div>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</div>'
    );
});

test('Multiple argument syntax', () => {
    assertEquals(
        jiccup.html(['h1', 'Title'], ['p', 'Paragraph']),
        '<h1>Title</h1><p>Paragraph</p>'
    );
});

// ============================================================================
// jiccup.html() tests - Error cases
// ============================================================================
console.log('\n=== jiccup.html() - Error cases ===');

test('null element throws error', () => {
    assertThrows(
        () => jiccup.html(['div', null]),
        'null values are not allowed'
    );
});

test('undefined element throws error', () => {
    assertThrows(
        () => jiccup.html(['div', undefined]),
        'undefined values are not allowed'
    );
});

test('null class attribute is converted to empty string', () => {
    // Note: class and style attributes have special processing that converts null to empty string
    assertEquals(
        jiccup.html(['div', {class: null}]),
        '<div class=""></div>'
    );
});

test('undefined attribute throws error', () => {
    assertThrows(
        () => jiccup.html(['div', {id: undefined}]),
        'Attribute "id" has an undefined value'
    );
});

test('null regular attribute throws error', () => {
    assertThrows(
        () => jiccup.html(['div', {title: null}]),
        'Attribute "title" has a null value'
    );
});

test('Invalid tag name throws error', () => {
    assertThrows(
        () => jiccup.html(['<script>', 'Bad']),
        'Invalid tag name'
    );
});

test('Tag with spaces throws error', () => {
    assertThrows(
        () => jiccup.html(['div class="bad"', 'Content']),
        'Invalid tag format - spaces not allowed'
    );
});

// ============================================================================
// jiccup.html() tests - Edge cases
// ============================================================================
console.log('\n=== jiccup.html() - Edge cases ===');

test('Very deep nesting (near limit)', () => {
    let deep = 'Deep';
    for (let i = 0; i < 50; i++) {
        deep = ['div', deep];
    }
    const result = jiccup.html(deep);
    assert(result.includes('Deep'), 'Should contain Deep text');
    assert(result.split('<div>').length === 51, 'Should have 50 opening divs');
});

test('Empty string tag name', () => {
    assertThrows(
        () => jiccup.html(['', 'Content']),
        'Invalid tag format'
    );
});

test('Numeric content', () => {
    assertEquals(
        jiccup.html(['div', 42]),
        '<div>42</div>'
    );
});

test('Boolean content', () => {
    assertEquals(
        jiccup.html(['div', true]),
        '<div>true</div>'
    );
});

test('Mixed content types', () => {
    assertEquals(
        jiccup.html(['div', 'Text', 123, ' ', true]),
        '<div>Text123 true</div>'
    );
});

test('Tag cache functionality (performance)', () => {
    // Create many elements with same tag pattern
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
        jiccup.html(['div#test.class1.class2', 'Content']);
    }
    const duration = Date.now() - start;
    assert(duration < 100, 'Tag cache should make repeated parsing fast');
});

// ============================================================================
// jiccup.render() tests
// ============================================================================
console.log('\n=== jiccup.render() tests ===');

test('Basic render with event', () => {
    const result = jiccup.render(['button', {'on:click': () => {}}, 'Click']);
    assert(result.html.includes('<button'), 'Should have button tag');
    assert(result.html.includes('data-jiccup-id'), 'Should have data-jiccup-id');
    assertEquals(result.bindings.length, 1, 'Should have one binding');
    assertEquals(Object.keys(result.bindings[0].events).length, 1, 'Should have one event');
});

test('Multiple events on same element', () => {
    const result = jiccup.render(['button', {
        'on:click': () => {},
        'on:mouseover': () => {},
        'on:mouseout': () => {}
    }, 'Hover']);
    assertEquals(result.bindings.length, 1, 'Should have one binding');
    assertEquals(Object.keys(result.bindings[0].events).length, 3, 'Should have three events');
});

test('Nested elements with events', () => {
    const result = jiccup.render(['div',
        ['button', {'on:click': () => {}}, 'Button 1'],
        ['button', {'on:click': () => {}}, 'Button 2']
    ]);
    assertEquals(result.bindings.length, 2, 'Should have two bindings');
});

testDOM('render() attach method', () => {
    const container = document.createElement('div');
    const clicked = {count: 0};
    const result = jiccup.render(['button', {
        'on:click': () => clicked.count++
    }, 'Click me']);
    
    const element = result.attach(container);
    assertEquals(element, container, 'Should return container');
    assert(container.innerHTML.includes('Click me'), 'Should contain button text');
    
    // Simulate click
    const button = container.querySelector('button');
    button.click();
    assertEquals(clicked.count, 1, 'Click handler should be called');
});

testDOM('Event handler with correct this binding', () => {
    const container = document.createElement('div');
    let capturedThis = null;
    const result = jiccup.render(['button', {
        'on:click': function() { capturedThis = this; }
    }, 'Click']);
    
    result.attach(container);
    const button = container.querySelector('button');
    button.click();
    assertEquals(capturedThis, button, 'this should be the button element');
});

// ============================================================================
// jiccup.fragment() tests
// ============================================================================
console.log('\n=== jiccup.fragment() tests ===');

test('Fragment with multiple arguments', () => {
    const frag = jiccup.fragment(
        ['p', 'First'],
        ['p', 'Second'],
        ['p', 'Third']
    );
    assertEquals(frag[0], ':<>');
    assertEquals(frag.length, 4);
});

test('Fragment with no arguments', () => {
    const frag = jiccup.fragment();
    assertEquals(frag[0], ':<>');
    assertEquals(frag.length, 1);
});

test('Fragment with mixed content', () => {
    const result = jiccup.html(
        jiccup.fragment(
            ['h1', 'Title'],
            false && ['p', 'Hidden'],
            ['p', 'Visible']
        )
    );
    assertEquals(result, '<h1>Title</h1><p>Visible</p>');
});

// ============================================================================
// Integration tests
// ============================================================================
console.log('\n=== Integration tests ===');

test('Complex real-world structure', () => {
    const NavItem = ({href, text, active}) => 
        ['li', {class: active ? 'active' : ''},
            ['a', {href}, text]
        ];
    
    const Navigation = ({items, activeIndex}) =>
        ['nav',
            ['ul.nav-list',
                items.map((item, i) => 
                    [NavItem, {...item, active: i === activeIndex}]
                )
            ]
        ];
    
    const result = jiccup.html([Navigation, {
        items: [
            {href: '/', text: 'Home'},
            {href: '/about', text: 'About'},
            {href: '/contact', text: 'Contact'}
        ],
        activeIndex: 1
    }]);
    
    assert(result.includes('class="active"'), 'Should have active class');
    assert(result.includes('href="/about"'), 'Should have about link');
    assertEquals((result.match(/<li/g) || []).length, 3, 'Should have 3 list items');
});

test('Form with mixed inputs', () => {
    const result = jiccup.html(
        ['form', {method: 'POST', action: '/submit'},
            ['div.form-group',
                ['label', {for: 'name'}, 'Name:'],
                ['input', {type: 'text', id: 'name', name: 'name', required: true}]
            ],
            ['div.form-group',
                ['label', {for: 'email'}, 'Email:'],
                ['input', {type: 'email', id: 'email', name: 'email'}]
            ],
            ['div.form-group',
                ['input', {type: 'checkbox', id: 'subscribe', name: 'subscribe', checked: false}],
                ['label', {for: 'subscribe'}, 'Subscribe to newsletter']
            ],
            ['button', {type: 'submit'}, 'Submit']
        ]
    );
    
    assert(result.includes('method="POST"'), 'Should have POST method');
    assert(result.includes('required'), 'Should have required attribute');
    assert(!result.includes('checked'), 'Should not have checked attribute when false');
});

// ============================================================================
// Performance edge cases
// ============================================================================
console.log('\n=== Performance edge cases ===');

test('Maximum nesting depth exceeded', () => {
    let deep = 'Bottom';
    for (let i = 0; i < 101; i++) {
        deep = ['div', deep];
    }
    assertThrows(
        () => jiccup.html(deep),
        'Maximum nesting depth'
    );
});

test('Large number of siblings', () => {
    const elements = [];
    for (let i = 0; i < 1000; i++) {
        elements.push(['div', `Item ${i}`]);
    }
    const result = jiccup.html(['div', elements]);
    assertEquals((result.match(/<div>/g) || []).length, 1001, 'Should have 1001 divs');
});

test('Complex attribute combinations', () => {
    const result = jiccup.html(['div#main.container.active', 
        {
            class: ['extra', 'classes'],
            id: 'override',  // Should override shorthand
            style: {
                color: 'red',
                backgroundColor: 'blue'
            },
            'data-value': 123,
            disabled: false,
            readonly: true
        },
        'Content'
    ]);
    
    assert(result.includes('id="override"'), 'Attribute should override shorthand');
    assert(result.includes('class="extra classes"'), 'Attribute classes should override shorthand classes');
    assert(!result.includes('container active'), 'Shorthand classes should be overridden');
    assert(result.includes('readonly'), 'Should include boolean true attribute');
    assert(!result.includes('disabled'), 'Should not include boolean false attribute');
});

// ============================================================================
// Summary
// ============================================================================
console.log('\n=== Test Summary ===');
console.log('All tests passed! ✓');
