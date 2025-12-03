# FRONTEND_QUALITY_CHECK

- [重要度: medium] file: sellerportal/assets/static_resources/spa/js/lib/Jiccup/jiccup.js:390 (html)
  内容: 使用されている console.debug はロガーに置き換える必要があります (FRONTEND_CODE_QUALIFIER_ITEMS の 'console.log', 'console.debug' → logger使用へ)。

- [重要度: medium] file: sellerportal/assets/static_resources/spa/js/lib/Jiccup/jiccup.js:720 (validateElement)
  内容: 使用されている console.debug はロガーに置き換える必要があります (FRONTEND_CODE_QUALIFIER_ITEMS の 'console.log', 'console.debug' → logger使用へ)。

- [重要度: medium] file: sellerportal/assets/static_resources/spa/js/lib/Jiccup/jiccup.js:21 (CONFIG.MAX_DEPTH)
  内容: マジックナンバー 100 が直接定数に埋め込まれています。定数化して一元管理すべきです (SHARED_CODE_QUALIFIER_ITEMS の 'マジックナンバー/マジック文字列 → 定数化必須)。

- [重要度: medium] file: sellerportal/assets/static_resources/spa/js/lib/Jiccup/jiccup.js:21 (CONFIG.MAX_TAG_CACHE_SIZE)
  内容: マジックナンバー 1000 が直接定数に埋め込まれています。定数化して一元管理すべきです (SHARED_CODE_QUALIFIER_ITEMS の 'マジックナンバー/マジック文字列 → 定数化必須)。

- [重要度: low] file: sellerportal/assets/static_resources/spa/js/lib/Jiccup/jiccup.js:398 (html)
  内容: console.debug の出力で slice(0, 5) がハードコーディングされています。マジックナンバーは定数化すべきです。

- [重要度: low] file: sellerportal/assets/static_resources/spa/js/lib/Jiccup/jiccup.js:442 (html)
  内容: console.debug の出力で slice(0, 10) がハードコーディングされています。マジックナンバーは定数化すべきです。

- [重要度: low] file: sellerportal/assets/static_resources/spa/js/lib/Jiccup/jiccup.js:462 (reportError)
  内容: console.warn の出力で slice(0, 10) がハードコーディングされています。マジックナンバーは定数化すべきです。

