/**
 * Extended unit tests for jiccup.js
 * Covers minor features and additional edge cases
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
console.log('Running jiccup.js extended unit tests...\n');

// ============================================================================
// Edge cases for tag parsing
// ============================================================================
console.log('=== Tag parsing edge cases ===');

test('Invalid tag starting with ID throws error', () => {
    assertThrows(
        () => jiccup.html(['#onlyId']),
        'Invalid tag name'
    );
});

test('Invalid tag starting with class throws error', () => {
    assertThrows(
        () => jiccup.html(['.onlyClass']),
        'Invalid tag name'
    );
});

test('Tag with multiple # chars in ID', () => {
    // The regex captures everything after the first # as the ID value
    assertEquals(
        jiccup.html(['div#first#second#third', 'Content']),
        '<div id="first#second#third">Content</div>'
    );
});

test('Tag with numeric-like ID and classes', () => {
    assertEquals(
        jiccup.html(['div#123.456.789', 'Numbers']),
        '<div id="123" class="456 789">Numbers</div>'
    );
});

test('Tag with hyphenated names', () => {
    assertEquals(
        jiccup.html(['custom-element#my-id.my-class', 'Custom']),
        '<custom-element id="my-id" class="my-class">Custom</custom-element>'
    );
});

test('Empty class segments create spaces', () => {
    // The regex replaces . with space, creating multiple spaces for consecutive dots
    assertEquals(
        jiccup.html(['div...class1...class2...', 'Content']),
        '<div class="  class1   class2   ">Content</div>'
    );
});

// ============================================================================
// Attribute edge cases
// ============================================================================
console.log('\n=== Attribute edge cases ===');

test('Attributes with empty string values', () => {
    assertEquals(
        jiccup.html(['div', {title: '', alt: ''}, 'Empty attrs']),
        '<div title="" alt="">Empty attrs</div>'
    );
});

test('Attributes with zero values', () => {
    assertEquals(
        jiccup.html(['div', {tabindex: 0, 'data-index': 0}, 'Zero']),
        '<div tabindex="0" data-index="0">Zero</div>'
    );
});

test('Attributes with negative numbers', () => {
    assertEquals(
        jiccup.html(['div', {tabindex: -1, 'data-value': -100}, 'Negative']),
        '<div tabindex="-1" data-value="-100">Negative</div>'
    );
});

test('Attributes with very long values', () => {
    const longValue = 'a'.repeat(1000);
    const result = jiccup.html(['div', {title: longValue}, 'Long']);
    assert(result.includes(`title="${longValue}"`), 'Should include long attribute value');
});

test('Mixed attribute types in single element', () => {
    assertEquals(
        jiccup.html(['input', {
            type: 'text',
            value: 123,
            disabled: true,
            readonly: false,
            'data-null': false,
            placeholder: 'Enter text'
        }]),
        '<input type="text" value="123" disabled placeholder="Enter text">'
    );
});

test('Attribute names with special characters', () => {
    assertEquals(
        jiccup.html(['div', {'data-test-value': 'test', 'aria-label': 'Label'}, 'ARIA']),
        '<div data-test-value="test" aria-label="Label">ARIA</div>'
    );
});

test('Style attribute with empty object', () => {
    assertEquals(
        jiccup.html(['div', {style: {}}, 'Empty style']),
        '<div style="">Empty style</div>'
    );
});

test('Style attribute with null values in object', () => {
    // Note: JavaScript Object.entries will include null/undefined values
    assertEquals(
        jiccup.html(['div', {style: {color: 'red', margin: null, padding: undefined}}, 'Style']),
        '<div style="color: red; margin: null; padding: undefined">Style</div>'
    );
});

test('Class attribute with empty array', () => {
    assertEquals(
        jiccup.html(['div', {class: []}, 'Empty classes']),
        '<div class="">Empty classes</div>'
    );
});

test('Class array with all falsy values', () => {
    assertEquals(
        jiccup.html(['div', {class: [false, null, undefined, '', 0]}, 'No classes']),
        '<div class="">No classes</div>'
    );
});

test('Class array with duplicate values', () => {
    assertEquals(
        jiccup.html(['div', {class: ['btn', 'btn', 'active', 'btn']}, 'Duplicates']),
        '<div class="btn btn active btn">Duplicates</div>'
    );
});

// ============================================================================
// Escaping edge cases
// ============================================================================
console.log('\n=== HTML escaping edge cases ===');

test('Escaping in attribute values', () => {
    assertEquals(
        jiccup.html(['div', {title: 'Title with <script> & "quotes"'}, 'Safe']),
        '<div title="Title with &lt;script&gt; &amp; &quot;quotes&quot;">Safe</div>'
    );
});

test('Unicode characters should not be escaped', () => {
    assertEquals(
        jiccup.html(['div', '中文 日本語 한국어 🎉']),
        '<div>中文 日本語 한국어 🎉</div>'
    );
});

test('Escaping with mixed content types', () => {
    assertEquals(
        jiccup.html(['div', 'Text & ', ['span', '<escaped>'], ' more']),
        '<div>Text &amp; <span>&lt;escaped&gt;</span> more</div>'
    );
});

test('No escaping in dangerouslySetInnerHTML', () => {
    assertEquals(
        jiccup.html(['div', {dangerouslySetInnerHTML: '<script>alert("XSS")</script>'}]),
        '<div><script>alert("XSS")</script></div>'
    );
});

test('Multiple special characters in text', () => {
    assertEquals(
        jiccup.html(['div', '& < > " \' &amp; &lt; &gt; &quot; &#39;']),
        '<div>&amp; &lt; &gt; &quot; &#39; &amp;amp; &amp;lt; &amp;gt; &amp;quot; &amp;#39;</div>'
    );
});

// ============================================================================
// Fragment edge cases
// ============================================================================
console.log('\n=== Fragment edge cases ===');

test('Fragment with single child', () => {
    assertEquals(
        jiccup.html([':<>', ['div', 'Only child']]),
        '<div>Only child</div>'
    );
});

test('Fragment with false values (only false is ignored)', () => {
    assertEquals(
        jiccup.html([':<>', false, ['div', 'Real'], false, ['span', 'Content']]),
        '<div>Real</div><span>Content</span>'
    );
});

test('Nested fragments', () => {
    assertEquals(
        jiccup.html([':<>', 
            [':<>', ['p', 'A'], ['p', 'B']], 
            [':<>', ['p', 'C'], ['p', 'D']]
        ]),
        '<p>A</p><p>B</p><p>C</p><p>D</p>'
    );
});

test('Fragment function with no arguments', () => {
    assertEquals(
        jiccup.html(jiccup.fragment()),
        ''
    );
});

test('Fragment as child of element', () => {
    assertEquals(
        jiccup.html(['div', 
            jiccup.fragment(['span', 'A'], ['span', 'B'])
        ]),
        '<div><span>A</span><span>B</span></div>'
    );
});

// ============================================================================
// Function component edge cases
// ============================================================================
console.log('\n=== Function component edge cases ===');

test('Function component without props', () => {
    const NoProps = () => ['div', 'No props'];
    assertEquals(
        jiccup.html([NoProps]),
        '<div>No props</div>'
    );
});

test('Function component with spread children', () => {
    const Spread = ({children}) => ['div.wrapper', ...children];
    assertEquals(
        jiccup.html([Spread, {}, ['p', 'Child 1'], ['p', 'Child 2']]),
        '<div class="wrapper"><p>Child 1</p><p>Child 2</p></div>'
    );
});

test('Function component returning fragment', () => {
    const FragComp = () => [':<>', ['h1', 'Title'], ['p', 'Content']];
    assertEquals(
        jiccup.html(['div', [FragComp]]),
        '<div><h1>Title</h1><p>Content</p></div>'
    );
});

test('Function component with default props', () => {
    const WithDefaults = ({name = 'World', greeting = 'Hello'}) => 
        ['div', `${greeting}, ${name}!`];
    assertEquals(
        jiccup.html([WithDefaults, {name: 'Alice'}]),
        '<div>Hello, Alice!</div>'
    );
});

test('Deeply nested function components', () => {
    const Level3 = ({text}) => ['span', text];
    const Level2 = ({text}) => ['p', [Level3, {text}]];
    const Level1 = ({text}) => ['div', [Level2, {text}]];
    
    assertEquals(
        jiccup.html([Level1, {text: 'Deep'}]),
        '<div><p><span>Deep</span></p></div>'
    );
});

// ============================================================================
// Array handling edge cases
// ============================================================================
console.log('\n=== Array handling edge cases ===');

test('Empty array as child', () => {
    assertEquals(
        jiccup.html(['div', []]),
        '<div></div>'
    );
});

test('Array with mixed valid and falsy values', () => {
    assertEquals(
        jiccup.html(['div', [
            ['span', '1'],
            false,
            ['span', '2'],
            false,  // Only false is ignored, not null/undefined
            ['span', '3']
        ]]),
        '<div><span>1</span><span>2</span><span>3</span></div>'
    );
});

test('Deeply nested arrays', () => {
    assertEquals(
        jiccup.html(['div', [[[['span', 'Deep']]]]]),
        '<div><span>Deep</span></div>'
    );
});

test('Array with non-jiccup values', () => {
    assertEquals(
        jiccup.html(['div', ['Text', 123, true, ['span', 'Element']]]),
        '<div><Text>123true<span>Element</span></Text></div>'
    );
});

// ============================================================================
// Void elements edge cases
// ============================================================================
console.log('\n=== Void elements edge cases ===');

test('All void elements', () => {
    const voidElements = [
        'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
        'keygen', 'link', 'meta', 'menuitem', 'param', 'source', 'track', 'wbr'
    ];
    
    voidElements.forEach(tag => {
        const result = jiccup.html([tag]);
        assert(!result.includes(`</${tag}>`), `${tag} should not have closing tag`);
        assert(result === `<${tag}>`, `${tag} should be self-closing`);
    });
});

test('Void element with attributes and ignored children', () => {
    assertEquals(
        jiccup.html(['img', {src: 'test.jpg', alt: 'Test'}, 'This should be ignored']),
        '<img src="test.jpg" alt="Test">'
    );
});

test('Meta tag with various attributes', () => {
    assertEquals(
        jiccup.html(['meta', {charset: 'UTF-8', name: 'viewport', content: 'width=device-width'}]),
        '<meta charset="UTF-8" name="viewport" content="width=device-width">'
    );
});

// ============================================================================
// Style processing edge cases
// ============================================================================
console.log('\n=== Style processing edge cases ===');

test('Style with vendor prefixes', () => {
    assertEquals(
        jiccup.html(['div', {style: {
            WebkitTransform: 'rotate(45deg)',
            MozTransform: 'rotate(45deg)',
            msTransform: 'rotate(45deg)'
        }}, 'Rotated']),
        '<div style="-webkit-transform: rotate(45deg); -moz-transform: rotate(45deg); ms-transform: rotate(45deg)">Rotated</div>'
    );
});

test('Style with numeric values', () => {
    assertEquals(
        jiccup.html(['div', {style: {
            opacity: 0.5,
            zIndex: 100,
            lineHeight: 1.5
        }}, 'Styled']),
        '<div style="opacity: 0.5; z-index: 100; line-height: 1.5">Styled</div>'
    );
});

test('Style with calc() and var()', () => {
    assertEquals(
        jiccup.html(['div', {style: {
            width: 'calc(100% - 20px)',
            color: 'var(--main-color)'
        }}, 'Modern CSS']),
        '<div style="width: calc(100% - 20px); color: var(--main-color)">Modern CSS</div>'
    );
});

test('Mixed style string and object on same element', () => {
    assertEquals(
        jiccup.html(['div#styled.class', {
            style: 'color: blue; margin: 10px'
        }, 'Mixed']),
        '<div id="styled" class="class" style="color: blue; margin: 10px">Mixed</div>'
    );
});

// ============================================================================
// Performance and limits
// ============================================================================
console.log('\n=== Performance and limits ===');

test('Maximum safe depth (100 levels)', () => {
    let element = 'Bottom';
    for (let i = 0; i < 100; i++) {
        element = ['div', element];
    }
    const result = jiccup.html(element);
    assert(result.includes('Bottom'), 'Should render to max depth');
    assertEquals((result.match(/<div>/g) || []).length, 100, 'Should have exactly 100 divs');
});

test('Just over maximum depth (101 levels)', () => {
    let element = 'Too deep';
    for (let i = 0; i < 101; i++) {
        element = ['div', element];
    }
    assertThrows(
        () => jiccup.html(element),
        'Maximum nesting depth 100 exceeded'
    );
});

test('Very wide element (many siblings)', () => {
    const children = [];
    for (let i = 0; i < 10000; i++) {
        children.push(['span', i]);
    }
    const result = jiccup.html(['div', children]);
    assertEquals((result.match(/<span>/g) || []).length, 10000, 'Should handle many siblings');
});

test('Tag cache with special characters', () => {
    // These should all be cached separately
    const patterns = [
        'div#id.class',
        'div#id.class.another',
        'div#different.class',
        'span#id.class'
    ];
    
    patterns.forEach(pattern => {
        const result1 = jiccup.html([pattern, 'Test']);
        const result2 = jiccup.html([pattern, 'Test']);
        assertEquals(result1, result2, 'Cached results should be identical');
    });
});

// ============================================================================
// Mixed content edge cases
// ============================================================================
console.log('\n=== Mixed content edge cases ===');

test('Object as text content (toString)', () => {
    const obj = {
        toString() { return 'Custom string'; }
    };
    assertEquals(
        jiccup.html(['div', obj]),
        '<div toString="toString() { return &#39;Custom string&#39;; }"></div>'
    );
});

test('Date object as content', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    const result = jiccup.html(['div', date]);
    assert(result.includes(date.toString()), 'Should use date toString()');
});

test('Mixing all content types (excluding null)', () => {
    assertEquals(
        jiccup.html(['div',
            'String ',
            123,
            ' ',
            true,
            ' ',
            false,  // false is ignored
            ' ',
            ['span', 'nested'],
            ' '
        ]),
        '<div>String 123 true  <span>nested</span> </div>'
    );
});

// ============================================================================
// Event handling edge cases (render API)
// ============================================================================
console.log('\n=== Event handling edge cases ===');

test('Event handler with empty function', () => {
    const result = jiccup.render(['button', {'on:click': function() {}}, 'Click']);
    assertEquals(result.bindings.length, 1);
    assertEquals(typeof result.bindings[0].events.click, 'function');
});

test('Multiple elements with same event type', () => {
    const result = jiccup.render(['div',
        ['button', {'on:click': () => console.log('1')}, 'Button 1'],
        ['button', {'on:click': () => console.log('2')}, 'Button 2'],
        ['button', {'on:click': () => console.log('3')}, 'Button 3']
    ]);
    assertEquals(result.bindings.length, 3, 'Should have 3 separate bindings');
});

test('Event names with different cases', () => {
    const result = jiccup.render(['div', {
        'on:click': () => {},
        'on:mouseOver': () => {},  // Capital O
        'on:DOMContentLoaded': () => {}  // DOM prefix
    }, 'Events']);
    
    assert('click' in result.bindings[0].events, 'Should have click');
    assert('mouseOver' in result.bindings[0].events, 'Should preserve case');
    assert('DOMContentLoaded' in result.bindings[0].events, 'Should handle DOM events');
});

test('Non-function values in on: attributes', () => {
    const result = jiccup.render(['button', {
        'on:click': () => {},
        'on:invalid': 'not a function',  // Should be ignored
        'on:hover': 123  // Should be ignored
    }, 'Button']);
    
    assertEquals(Object.keys(result.bindings[0].events).length, 1, 'Should only bind functions');
});

// ============================================================================
// Error edge cases
// ============================================================================
console.log('\n=== Error edge cases ===');

test('Tag name with script tags', () => {
    assertThrows(
        () => jiccup.html(['<img src=x onerror=alert(1)>', 'XSS']),
        'Invalid tag name'
    );
});

test('Tag name with quotes', () => {
    assertThrows(
        () => jiccup.html(['"div"', 'Bad']),
        'Invalid tag name'
    );
});

test('Tag name starting with number', () => {
    assertThrows(
        () => jiccup.html(['123div', 'Bad']),
        'Invalid tag name'
    );
});

test('Whitespace in tag shorthand', () => {
    assertThrows(
        () => jiccup.html(['div #id', 'Bad']),
        'Invalid tag name'
    );
});

// ============================================================================
// Cleanup utility
// ============================================================================
console.log('\n=== Cleanup utility ===');

testDOM('cleanup method removes content and event listeners', () => {
    const container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    
    // Add content with events
    const clicked = {count: 0};
    const result = jiccup.render(['button', {
        'on:click': () => clicked.count++
    }, 'Click me']);
    
    result.attach(container);
    const button = container.querySelector('button');
    
    // Verify event works
    button.click();
    assertEquals(clicked.count, 1, 'Event should fire');
    
    // Clean up
    jiccup.cleanup(container);
    assertEquals(container.innerHTML, '', 'Container should be empty');
    
    // Remove test container
    document.body.removeChild(container);
});

testDOM('cleanup with selector', () => {
    const container = document.createElement('div');
    container.id = 'cleanup-test';
    document.body.appendChild(container);
    container.innerHTML = '<p>Content</p>';
    
    jiccup.cleanup('#cleanup-test');
    assertEquals(container.innerHTML, '', 'Should clear by selector');
    
    document.body.removeChild(container);
});

// ============================================================================
// Constants export
// ============================================================================
console.log('\n=== Constants export ===');

test('CONSTANTS object is exported', () => {
    assert(jiccup.CONSTANTS, 'Should export CONSTANTS');
    assert(jiccup.CONSTANTS.FRAGMENT === ':<>', 'Should have FRAGMENT constant');
    assert(jiccup.CONSTANTS.EVENT_PREFIX === 'on:', 'Should have EVENT_PREFIX');
    assert(jiccup.CONSTANTS.CLASS === 'class', 'Should have CLASS constant');
    assert(jiccup.CONSTANTS.STYLE === 'style', 'Should have STYLE constant');
});

test('Error messages in CONSTANTS', () => {
    assert(typeof jiccup.CONSTANTS.ERROR_NULL === 'string', 'Should have ERROR_NULL message');
    assert(typeof jiccup.CONSTANTS.ERROR_UNDEFINED === 'string', 'Should have ERROR_UNDEFINED message');
    assert(typeof jiccup.CONSTANTS.ERROR_ATTR_NULL === 'function', 'Should have ERROR_ATTR_NULL function');
    assert(typeof jiccup.CONSTANTS.ERROR_ATTR_UNDEFINED === 'function', 'Should have ERROR_ATTR_UNDEFINED function');
});

// ============================================================================
// Summary
// ============================================================================
console.log('\n=== Extended Test Summary ===');
console.log('All extended tests completed! ✓');
