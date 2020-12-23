export const _runtime = {
    options: {
        prefix: null
    },
    generated: {}
}

export const funcs = {}

const _isColor = c => {
    if (c[0] === '#')
        return c

    const el = new Option()
    const s = el.style
    s.color = c

    return s.color == c
}

const _isSide = s => {
    return ['top', 'right', 'bottom', 'left'].includes(s)
}

export const _kebabCase = s => {
    return s.replace(/([A-Z]{1})/g, '-$1').toLowerCase()
}

export const _color = (color, propName) => {

    if (!_isColor(color)) {
        throw new Error(`"${color}" is not valid color`)
    }

    if (color[0] === '#') {
        return color;
    }

    if (propName) {
        return `var(--${propName}, var(--${color}, ${color}))`
    }

    return `var(--${color}, ${color})`
}

/** size */
export const _size = (size, propName) => {

    size = size + ''

    if (size === 'auto') {
        return size
    }

    if (size.includes('#')) {
        return size
    }

    if (_isColor(size)) {
        return size
    }

    if (!/[0-9]+/g.test(size)) {
        return size
    }

    const pattern = /^[0-9\.]+(rem|em|vw|vh|px|pt|%)/
    const match = size.match(pattern)

    if (!match) {
        size = size + 'rem'
    }

    if (propName) {
        return `var(--${propName}, ${size})`
    }

    return size
}

export const css = (s, ...v) => s.reduce((a, c, i) => {
    a.push(c)
    v[i] && a.push(v[i])
    return a
}, []).join('')

export const knownPropsToKnownValues = knownProps =>
    Object.keys(knownProps)
        .reduce(
            (a, propName) => {
                knownProps[propName]
                    .forEach(value => a[value] = propName)

                return a
            },
            // Accumulator
            {}
        )

export const knownProps = {
    'font-weight': ['bold', 'bolder', 'light', 'lighter'],
    'display': ['block', 'flex', 'inline']
}

export const knownValues = knownPropsToKnownValues(knownProps)

export const sides = ['top', 'right', 'bottom', 'left']

/** Parse Class Name. 
 *  
 *  func[-arg1-arg2-...argX][^|@md|^|@lg][:hover|:after|:before]
 */
export const parseClassName = cn => {
    if (_runtime.options.prefix)
        cn = cn.replace(`${_runtime.options.prefix}_`, '')

    const t = cn.includes('^')
    const p = cn.split(':')
    const s = t ? p[0].split('^') : p[0].split('@')
    const a = s[0].split('-')
    
    return {
        func: a[0],
        props: a.slice(1),
        media: s[1] ? (t ? '^' + s[1] : '@' + s[1]) : null,
        pseudo: p.slice(1)
    }
}

/** Grouopping Prams By Type
 *  - If typed param is found ex: class="p2-1-2-1"
 *    then fallowing numeric params will be grouped by its type
 *    unless new type will be found
 */
export const groupProps = (p = []) => {
    let currentType = 'numeric'

    const groups = {
        // Vertical (top + botton)
        v: [],
        // Horizontal
        h: [],
        // Width
        x: [],
        // Height
        y: [],

        t: [],
        r: [],
        b: [],
        l: [],

        // Numeric
        numeric: [],

        // Colors
        colors: [],

        // Known Props
        known: [],

        // Unknown Props
        unknown: []
    }

    for (let _p of p) {

        if (knownValues[_p]) {
            groups.known.push(_p)
            continue
        }

        if (_isColor(_p)) {
            groups.colors.push(_p)
            continue
        }

        const name = _p.substr(0, 3).replace(/([a-z]*).*/gi, '$1').trim()
        const numericVal = _p.replace(/[^0-9.]+/gi, '').trim()

        if (name !== '') {
            currentType = name
            if (!groups[currentType])
                groups.unknown.push(_p)

            continue
        }

        if (numericVal !== '' || _p === '') {
            groups[currentType].push(_p)
            continue
        }

        groups.unknown.push(_p)
    }

    return groups
}

/** Reset Element To Pure Basics */
export const _ = () => css`
    padding: 0;
    margin: 0;
    list-style: none;
    text-decoration: none;
    text-transform: none;
    background-color: var(--background-color, transparent);`

/** Position Properties Shortcuts. */
export const rel = () =>
    css`position: relative;`

export const abs = () =>
    css`position: absolute;`

/** Box Properties Shortcuts. */
export const none = () =>
    css`display: none;`

export const block = () =>
    css`display: block;`

export const w = (f, v) =>
    css`width: ${_size(v)};`

export const container = (f, ...v) =>
    css`
        max-width: ${_size(v[0] || 80)};
        padding-left: ${_size(v[1] || 1)};
        padding-right: ${_size(v[1] || 1)};
        margin-left: auto;
        margin-right: auto;
    `

export const h = (f, v) =>
    css`height: ${_size(v)};`

export const m = (f, ...v) =>
    _isSide(v[0])
        ? `margin-${v[0]}: ${_size(v[1] || 1)};`
        : `margin: ${_size(v[0] || 1)};`

export const mv = (f, ...v) =>
    css`
        margin-top: ${_size(v[0] || 1)};
        margin-bottom: ${_size(v[0] || 1)};
    `

export const p = (f, ...v) =>
    _isSide(v[0])
        ? `padding-${v[0]}: ${_size(v[1] || 1)};`
        : `padding: ${_size(v[0] || 1)};`

export const pv = (f, ...v) =>
    css`
        padding-top: ${_size(v[0] || 1)};
        padding-bottom: ${_size(v[0] || 1)};
    `

export const ph = (f, ...v) =>
    css`
        padding-left: ${_size(v[0] || 1)};
        padding-right: ${_size(v[0] || 1)};
    `

export const border = (f, a, b) =>
    _isSide(a)
        ?
        `
        border-${a}: 1px solid ${_color('silver', 'border-color')};
        border-radius: 0;
        `
        :
        css`
        border: 1px solid ${_color('silver', 'border-color')};
        border-radius: var(--border-radius, .25rem);
        `

export const radius = (f, a) =>
    css`border-radius: ${a ? _size(a) : 'var(--border-radius, .25rem)'};`

/** Flex Properties Shortcuts. */
export const gutter = (f, v) =>
    css`--gutter: ${v ? _size(v) : '1rem'};`

export const row = (f, ...v) =>
    `
    display: flex;
    flex-direction: row;
    margin: calc(var(--gutter) / 2 * -1);
    ${v.includes('wrap') ? 'flex-flow: wrap;' : ''}
    `

export const col = (f, v) =>
    `
    ${row(f, v)}
    flex-direction: column;
    `

export const item = (f, ...v) => {
    const g = css`padding: calc(var(--gutter) / 2);`
    if (v.includes('s'))
        return css`flex: 0 0 auto; ` + g

    if (v.includes('a'))
        return css`flex: auto; ` + g

    if (v.includes('e'))
        return css`flex: auto; width: 0; ` + g

    if (v[0] || v[1])
        return css`order: ${v[0] || v[1]};`

    return css`flex: 1 1 auto;` + g
}

export const auto = (f, v) =>
    css`
    flex: auto;
    padding: calc(var(--gutter) / 2);
    `

export const skinny = (f, v) =>
    css`
    flex: 0 0 auto;
    padding: calc(var(--gutter) / 2);
    `

export const eq = (f, v) =>
    css`
    flex: auto;
    width: 0;
    padding: calc(var(--gutter) / 2);
    `

/** Text Properties Shortcuts. */
export const font = (f, s, w) =>
    `
    ${s ? `font-size: ${_size(s)};` : ''}
    ${w ? `font-weight: ${w};` : ''}
    `
export const cap = (f, v) =>
    css`text-transform: capitalize;`

export const uc = (f, v) =>
    css`text-transform: uppercase;`

export const lc = (f, v) =>
    css`text-transform: lowercase;`

export const align = (f, v) =>
    css`text-align: ${v};`

export const weight = (f, v) =>
    css`font-weight: ${v};`

/** Background Properties Shortcuts. */
export const bg = (f, v) =>
    css`background-color: ${_color(v)};`

export const fallback = (f, ...v) => {

    if (knownValues[f])
        return `${knownValues[_kebabCase(f)]}: ${f};`

    if (_isColor(f) && !v[0])
        return css`color: ${f};`

    /** Latest Fallback Is Just Seting Of The Prop. */
    const _v = v.map(i => _size(_kebabCase(i))).join(' ')
    const _f = _kebabCase(f)
    return `${_f}: ${_v};`
}