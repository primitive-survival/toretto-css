const _isColor = c => {
    const el = new Option()
    const s = el.style
    s.color = c
    return s.color == c
}

const _isSide = s => {
    return ['top', 'right', 'bottom', 'left'].includes(s)
}

const _kebabCase = s => {
    return s.replace(/([A-Z]{1})/g, '-$1').toLowerCase()
}

const _color = (color, propName) => {

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
const _s = (size, propName) => {

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

const css = (s, ...v) => s.reduce((a, c, i) => {
    a.push(c)
    v[i] && a.push(v[i])
    return a
}, []).join('')

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
    `width: ${_s(v)}`

export const container = (f, ...v) =>
    css`
        max-width: ${_s(v[0] || 80)};
        padding-left: ${_s(v[1] || 1)};
        padding-right: ${_s(v[1] || 1)};
        margin-left: auto;
        margin-right: auto;
    `

export const h = (f, v) =>
    css`height: ${_s(v)}`

export const m = (f, ...v) =>
    _isSide(v[0])
        ? `margin-${v[0]}: ${_s(v[1] || 1)};`
        : `margin: ${_s(v[0] || 1)};`

export const mv = (f, ...v) => 
    css`
    margin-top: ${_s(v[0] || 1)};
    margin-bottom: ${_s(v[0] || 1)};
    `

export const p = (f, ...v) =>
    _isSide(v[0])
        ? `padding-${v[0]}: ${_s(v[1] || 1)};`
        : `padding: ${_s(v[0] || 1)};`

export const pv = (f, ...v) => 
    css`
    padding-top: ${_s(v[0] || 1)};
    padding-bottom: ${_s(v[0] || 1)};
    `

export const ph = (f, ...v) => 
    css`
    padding-left: ${_s(v[0] || 1)};
    padding-right: ${_s(v[0] || 1)};
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
    css`border-radius: ${a ? _s(a) : 'var(--border-radius, .25rem)'};`

/** Flex Properties Shortcuts. */
export const gutter = (f, v) =>
    css`--gutter: ${v ? _s(v) : '1rem'};`

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
export const text = (f, s, w) =>
    `
    ${s ? `font-size: ${_s(s)};` : ''}
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
    if (_isColor(f) && !v[0])
        return css`color: ${f};`

    /** Latest Fallback Is Just Seting Of The Prop. */
    const _v = v.map(i => _s(_kebabCase(i))).join(' ')
    const _f = _kebabCase(f)
    return `${_f}: ${_v};`
}