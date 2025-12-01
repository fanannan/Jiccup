# DESIGN_CHECK

- [重要度: high] file: sellerportal/assets/static_resources/spa/js/lib/Jiccup/jiccup.js:0
  内容: Opencode応答がJSON配列ではありません。プロンプトに従いJSON配列のみを返すよう修正してください。
  備考: We need to review design doc vs code for inconsistencies. Identify issues: design mentions fragment tag ':<>' etc matches. Check ID/class parsing: design allows multiple classes and ID any order, only one ID. Code does that. Ensure error handling matches design: design says invalid formats throw JiccupError. Code does. Check max depth 100 matches design? Not explicitly in design but okay. Design mentions event handlers using 'on:' prefix, code uses EVENT_PREFIX 'on:' and registers. Good.

Design mentions attribute processing: style object conversion, class array, dangerousSetInnerHTML. Code implements.

Design mentions that null/undefined should error with 3-element messages. Code's throwIfNullOrUndefined builds detailed diagnostics, includes error codes. Good.

Potential missing: design mentions that false should be ignored (conditional rendering). Code's validateElement returns false for element===false, skipping. Good.

Design mentions that fragment can be created via jiccup.fragment function. Code provides fragment.

Potential issue: design mentions that tag cache size 1000 entries, max depth maybe not specified but okay.

Check that parseTag regex allows multiple IDs? It throws error on multiple IDs. Good.

Check that attribute validation for false values: validateAttributeValue returns false if value===false, skipping attribute. Good.

Potential missing: design mentions that attribute values null/undefined should error. Code does.

Potential missing: design mentions that empty selectors not allowed. Code checks empty ID/class.

Potential discrepancy: design mentions that tag name validation should reject invalid characters like '@' etc. Code regex /^[a-zA-Z][a-zA-Z0-9-]*$/ matches.

Design mentions that spaces not allowed. Code checks.

Potential missing: design mentions that tag cache should evict oldest when exceeding size. Code deletes firstKey.

Potential issue: getDebugInfo cacheSize uses Object.keys(tagCache).length but tagCache is Map; Object.keys on Ma

