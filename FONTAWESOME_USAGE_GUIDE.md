# FontAwesome Icons Usage Guide with Jiccup

## 問題の概要

FontAwesome のアイコンクラス（例: `"fas fa-chart-bar"`）にはスペースが含まれているため、Jiccup のセレクター構文（例: `i.fas fa-chart-bar`）では以下のエラーが発生します：

```
JiccupError: Invalid tag format - spaces not allowed: "i.fas fa-chart-bar"
```

## ❌ 間違った使用方法

```javascript
// エラー: セレクター内でスペースを含むクラスを使用
[`i.${CONSTANTS.HOME_VIEW.ICONS.CHART_BAR}`]  // = "fas fa-chart-bar"
// 結果: JiccupError: Invalid tag format - spaces not allowed

// エラー: 複数クラスの組み合わせをセレクターで使用
[`i.${card.icon}.${CONSTANTS.HOME_VIEW.STYLES.ICON_SIZE_3X}.${CONSTANTS.HOME_VIEW.CLASSES.OPACITY_50}`]
// 結果: "i.fas fa-handshake.text-3xl.opacity-50" → スペースでエラー
```

## ✅ 正しい使用方法

### 1. 単一アイコンクラス - 属性オブジェクト使用（推奨）

```javascript
// ❌ 修正前
[`i.${CONSTANTS.HOME_VIEW.ICONS.CHART_BAR}`]

// ✅ 修正後
['i', { class: CONSTANTS.HOME_VIEW.ICONS.CHART_BAR }]
```

### 2. 複数クラス組み合わせ - 属性オブジェクト使用（推奨）

```javascript
// ❌ 修正前  
[`i.${card.icon}.${CONSTANTS.HOME_VIEW.STYLES.ICON_SIZE_3X}.${CONSTANTS.HOME_VIEW.CLASSES.OPACITY_50}`]

// ✅ 修正後
['i', { class: `${card.icon} ${CONSTANTS.HOME_VIEW.STYLES.ICON_SIZE_3X} ${CONSTANTS.HOME_VIEW.CLASSES.OPACITY_50}` }]
```

### 2. IDが必要な場合

```javascript
['i', { 
    id: 'login-icon',
    class: `${ICONS.SIGN_IN} text-blue-500` 
}]
```

### 3. セレクター構文を使いたい場合

セレクター構文は単一クラスの場合のみ使用可能：

```javascript
// アイコンクラスは属性で、その他はセレクターで
['i.text-blue-500', { 
    class: ICONS.SIGN_IN 
}]
```

## エラー検出方法

### 1. 正規表現による検索

以下のパターンでコード内の問題を検出できます：

```bash
# セレクター内で定数を使用している箇所を検索
grep -rn "\[\s*\`[^\`]*\${[^}]*ICON[^}]*}.*\`" .

# より一般的なパターン
grep -rn "\[\s*\`[iI]\.\${" .
```

### 2. ESLint カスタムルール

```javascript
// eslint-custom-rules/no-fontawesome-in-selectors.js
module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow FontAwesome constants in Jiccup selectors',
            category: 'Possible Errors',
        },
        fixable: 'code',
    },
    create(context) {
        return {
            TemplateLiteral(node) {
                if (node.parent.type === 'ArrayExpression' &&
                    node.quasis[0].value.raw.match(/^[a-z]+\./i) &&
                    node.expressions.some(exp => 
                        exp.type === 'MemberExpression' &&
                        exp.property.name && 
                        exp.property.name.includes('ICON')
                    )) {
                    context.report({
                        node,
                        message: 'FontAwesome constants should not be used in Jiccup selectors. Use class attribute instead.',
                    });
                }
            }
        };
    }
};
```

### 3. 開発時の検証スクリプト

```javascript
// scripts/validate-jiccup-usage.js
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function validateJiccupUsage(dir) {
    const errors = [];
    
    function checkFile(filepath) {
        const content = readFileSync(filepath, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            // セレクター内でICON定数を使用しているパターンを検出
            if (line.match(/\[\s*`[^`]*\$\{[^}]*ICON[^}]*\}[^`]*`\s*[\],]/)) {
                errors.push({
                    file: filepath,
                    line: index + 1,
                    content: line.trim()
                });
            }
        });
    }
    
    function walkDir(currentDir) {
        const files = readdirSync(currentDir);
        
        files.forEach(file => {
            const filepath = join(currentDir, file);
            const stat = statSync(filepath);
            
            if (stat.isDirectory() && !file.startsWith('.')) {
                walkDir(filepath);
            } else if (file.endsWith('.js')) {
                checkFile(filepath);
            }
        });
    }
    
    walkDir(dir);
    
    if (errors.length > 0) {
        console.error('FontAwesome usage errors found:');
        errors.forEach(error => {
            console.error(`${error.file}:${error.line} - ${error.content}`);
        });
        process.exit(1);
    } else {
        console.log('✓ No FontAwesome selector errors found');
    }
}

// 使用例
validateJiccupUsage('./spa/js');
```

## ベストプラクティス

1. **定数の命名規則**
   - 複数クラスを含む定数には `_CLASSES` サフィックスを付ける
   - 例: `SIGN_IN_ICON_CLASSES = "fas fa-sign-in-alt"`

2. **コンポーネント設計**
   ```javascript
   // アイコンコンポーネントを作成
   function Icon({ name, className = '', ...attrs }) {
       return ['i', { 
           class: `${ICON_CLASSES[name]} ${className}`,
           ...attrs 
       }];
   }
   
   // 使用例
   [Icon, { name: 'SIGN_IN', className: 'text-blue-500' }]
   ```

3. **TypeScript/JSDoc 型定義**
   ```javascript
   /**
    * @typedef {Object} IconConstants
    * @property {string} SIGN_IN - FontAwesome sign-in icon classes
    * @property {string} WARNING - FontAwesome warning icon classes
    */
   ```

## まとめ

- Jiccup のセレクター構文は CSS セレクターと同じルールに従う
- スペースを含むクラスはセレクター構文では使用できない
- FontAwesome のようなマルチクラス定数は属性オブジェクトで指定する
- 開発時の検証ツールを活用してエラーを早期発見する