/**
 * Jiccup の公開構造型と入力契約。
 *
 * Plain JavaScript 実装の JSDoc が参照する型正本であり、実行コードは持たない。
 * canonical Node は component を含まない再帰構造の部分集合として保存できる。
 * 必須 props が異なる component は公開 API の入力ごとの検査で相関を保つ。
 * 属性の変換方針は従来の正規型を維持し、実装の広い coercion を昇格させない。
 */
export type JiccupText = string | number | boolean;
export type JiccupSkipped = null | false;
export type JiccupTag = string;

type JiccupMode = 'html' | 'render';
interface JiccupCommonAttributes {
    class?: string | readonly (string | JiccupSkipped | undefined)[];
    id?: string;
    style?: string | Readonly<Record<string, string>>;
    dangerouslySetInnerHTML?: string;
    [attribute: string]: unknown;
}

/** html はイベントを登録しないため、on:* を正規入力として受理しない。 */
export interface JiccupAttributes extends JiccupCommonAttributes {
    [event: `on:${string}`]: never;
}

/** render の on:* 関数は DOM の addEventListener へ渡される。 */
export interface JiccupEventAttributes extends JiccupCommonAttributes {
    [event: `on:${string}`]: EventListener;
}

type JiccupAttrs<Mode extends JiccupMode> = Mode extends 'html'
    ? JiccupAttributes : JiccupEventAttributes;
type JiccupCanonical<Mode extends JiccupMode> = string | JiccupNonString<Mode>;
type JiccupNonString<Mode extends JiccupMode> = number | boolean | null
    | JiccupTaggedElement<Mode> | JiccupGroup<Mode>;
type JiccupTaggedElement<Mode extends JiccupMode> =
    | readonly [JiccupTag, ...JiccupCanonical<Mode>[]]
    | readonly [JiccupTag, JiccupAttrs<Mode>, ...JiccupCanonical<Mode>[]];
type JiccupGroup<Mode extends JiccupMode> =
    | readonly JiccupNonString<Mode>[]
    | readonly [JiccupNonString<Mode>, ...JiccupCanonical<Mode>[]];

/** 文字列先頭は tag として解釈される。一般 string[] の flatten は保証しない。 */
export type JiccupNode = JiccupCanonical<'html'>;
export type JiccupElement = JiccupTaggedElement<'html'>;
export type JiccupRenderNode = JiccupCanonical<'render'>;
export type JiccupRenderElement = JiccupTaggedElement<'render'>;
export type JiccupFragment<Children extends readonly unknown[] = readonly JiccupNode[]> =
    readonly [':<>', ...Children];

export interface JiccupComponentProps {
    children: JiccupNode[];
    [property: string]: unknown;
}
export type JiccupComponent<Props extends object = JiccupComponentProps, Return = JiccupNode> =
    (props: Props) => Return;
/** 個別 props の関係を保存する tuple。公開呼出しが positional children も照合する。 */
export type JiccupComponentNode<Props extends object, Return = JiccupNode> =
    readonly [JiccupComponent<Props, Return>, Omit<Props, 'children'>, ...JiccupNode[]];

// 呼出し側の tuple を検査する。未知の props 関数を共通 Function 型へ消去しない。
type IsJiccupProps<Value> = Value extends readonly unknown[] ? false
    : Value extends object ? Value extends (...args: infer _Args) => unknown ? false : true : false;
type CheckJiccupChildren<Children extends readonly unknown[], Mode extends JiccupMode> = {
    [Index in keyof Children]: CheckJiccupInput<Children[Index], Mode>;
};
type CheckJiccupResult<Return, Mode extends JiccupMode> = Return extends JiccupCanonical<Mode>
    ? Return : CheckJiccupInput<Return, Mode>;
type CheckJiccupComponent<Component, Tail extends readonly unknown[], Mode extends JiccupMode> =
    Component extends (props: infer Props) => infer Return
        ? [Return] extends [CheckJiccupResult<Return, Mode>]
            ? Tail extends readonly [infer First, ...infer Rest]
                ? IsJiccupProps<First> extends true
                    ? Omit<First, 'children'> & { children: Rest } extends Props
                        ? readonly [Component, First, ...CheckJiccupChildren<Rest, Mode>] : never
                    : { children: Tail } extends Props
                        ? readonly [Component, ...CheckJiccupChildren<Tail, Mode>] : never
                : { children: Tail } extends Props
                    ? readonly [Component, ...CheckJiccupChildren<Tail, Mode>] : never
            : never
        : never;
type CheckJiccupTag<Tag extends string, Tail extends readonly unknown[], Mode extends JiccupMode> =
    Tag extends ':<>' ? readonly [Tag, ...CheckJiccupChildren<Tail, Mode>]
        : Tail extends readonly [infer First, ...infer Rest]
            ? IsJiccupProps<First> extends true
                ? readonly [Tag, First & JiccupAttrs<Mode>, ...CheckJiccupChildren<Rest, Mode>]
                : readonly [Tag, ...CheckJiccupChildren<Tail, Mode>]
            : readonly [Tag];
type CheckJiccupDeep<Value, Mode extends JiccupMode> = Value extends string | number | boolean | null
    ? Value : Value extends readonly [] ? Value
        : Value extends readonly [infer Head, ...infer Tail]
            ? Head extends string ? CheckJiccupTag<Head, Tail, Mode>
                : Head extends (...args: infer _Args) => unknown ? CheckJiccupComponent<Head, Tail, Mode>
                    : readonly [CheckJiccupInput<Head, Mode>, ...CheckJiccupChildren<Tail, Mode>]
            : Value extends readonly (infer Child)[] ? readonly CheckJiccupInput<Child, Mode>[] : never;
type CheckJiccupInput<Value, Mode extends JiccupMode> = Value extends JiccupCanonical<Mode>
    ? Value : CheckJiccupDeep<Value, Mode>;
/** single はその値、multi は引数全体を一つのノードとして解釈する。 */
type CheckJiccupArguments<Args extends readonly unknown[], Mode extends JiccupMode> =
    Args extends readonly [unknown] ? CheckJiccupChildren<Args, Mode> : CheckJiccupInput<Args, Mode>;

export interface JiccupBinding {
    id: string;
    events: Record<string, EventListener>;
}
export interface JiccupRenderResult {
    html: string;
    bindings: JiccupBinding[];
    attach(container: string | Element): Element;
}
export interface JiccupDebugInfo {
    debugMode: boolean;
    version: string;
    cacheSize: number;
    constants: JiccupConstants;
    performance: { tagCacheEnabled: boolean; maxNestingDepth: number; maxCacheSize: number };
}
export interface JiccupErrorReport {
    timestamp: string;
    element: unknown;
    context: Record<string, unknown>;
    debugMode: boolean;
    callStack: string[] | undefined;
    systemInfo: { userAgent: string; platform: string };
}
export interface JiccupConstants {
    FRAGMENT: ':<>';
    DANGEROUS_HTML: 'dangerouslySetInnerHTML';
    CLASS: 'class';
    ID: 'id';
    STYLE: 'style';
    EVENT_PREFIX: 'on:';
    DATA_ID: 'data-jiccup-id';
    ID_PREFIX_TEMPLATE: 'jiccup-';
    ID_PREFIX: '#';
    CLASS_PREFIX: '.';
    TAG_OPEN: '<';
    TAG_CLOSE: '>';
    TAG_END_OPEN: '</';
    ATTR_QUOTE: '"';
    ATTR_EQUALS: '=';
    SPACE: ' ';
    EMPTY_STRING: '';
    TAG_PATTERN: RegExp;
    CLASS_SEPARATOR: RegExp;
    ESCAPE_PATTERN: RegExp;
    CAMEL_CASE_PATTERN: RegExp;
    ERROR_UNDEFINED: string;
    ERROR_ATTR_UNDEFINED(key: string): string;
}
export interface JiccupApi {
    // 既知の再帰型を先行 overload で受理し、有限入力の検査で再帰展開し続けない。
    html(...args: JiccupNode[]): string;
    html<const Args extends unknown[]>(...args: Args & CheckJiccupArguments<NoInfer<Args>, 'html'>): string;
    render(...args: JiccupRenderNode[]): JiccupRenderResult;
    render<const Args extends unknown[]>(...args: Args & CheckJiccupArguments<NoInfer<Args>, 'render'>): JiccupRenderResult;
    // Sentinel と各 child 型を保存する。子の tuple 長や位置相関は返型で約束しない。
    fragment<const Children extends unknown[]>(...children: Children & CheckJiccupChildren<NoInfer<Children>, 'render'>):
        JiccupFragment<Array<Children[number]>>;
    escapeHtml(str: string): string;
    cleanup(container: string | Element): Element;
    debugMode: boolean;
    enableDebugMode(): JiccupApi;
    disableDebugMode(): JiccupApi;
    getDebugInfo(): JiccupDebugInfo;
    reportError(element: unknown, context?: Record<string, unknown>): JiccupErrorReport | null;
    CONSTANTS: JiccupConstants;
}
