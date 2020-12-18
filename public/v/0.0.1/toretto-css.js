
import * as funcs from './toretto-funcs.js'

const _runtime = {
    generated: {}
}

const sizes = {
    '@md': '(min-width: 50rem) and (max-width: 100rem)',
    '@lg': '(min-width: 100rem)',
    '^md': '(min-width: 50rem)',
    '^lg': '(min-width: 100rem)',
}
/** EscapeClassName
 * 
 */
export const escapeClassName = cn => {
    const p = cn.split(':')
    const pseudo = p[1] ? ':' + p.slice(1).join(':') : ''
    return cn.replace(/([()%@#:.^/]{1})/gi, '\\$1') + pseudo
}

/** Parse Class Name. 
 *  
 *  func[-arg1-arg2-...argX][^|@md|^|@lg][:hover|:after|:before]
 */
export const parseClassName = cn => {
    const t = cn.includes('^')
    const p = cn.split(':')
    const s = t ? p[0].split('^') : p[0].split('@')
    const a = s[0].split('-')
    return {
        func: a[0],
        args: a.slice(1),
        size: s[1] && (t ? '^' + s[1] : '@' + s[1]),
        pseudo: p.slice(1)
    }
}

/** Create Style Based On Class Name. 
 * 
 * */
export const createStyle = cn => {

    const tokens = parseClassName(cn.trim())
    const rawStyle = (funcs[tokens.func] || funcs.fallback)(
        tokens.func,
        ...tokens.args
    )
    const escapedName = escapeClassName(cn)
    let style = ''

    if (tokens.size && sizes[tokens.size])
        style = `@media screen and ${sizes[tokens.size]} { 
            .${escapedName} {
                ${rawStyle}
            }
        }`
    else if (tokens.size) 
        style = `.${tokens.size.substr(1)} .${escapedName} {
            ${rawStyle}
        }`
    else
        style = `.${escapedName} {
            ${rawStyle}
        }`
    
    return style
}

/** Generate Style From Nodes Added After Mutation. 
 * 
 */
export function walkNodes(nodes) {
    const styles = []

    for (let node of nodes) {
        if (!node.className) {
            continue
        }

        for (let cn of node.className.split(' ')) {
            if (_runtime.generated[cn])
                continue

            _runtime.generated[cn] = true

            const el = document.createElement('style')
            el.innerHTML = createStyle(cn)
            el.id = cn
            document
                .head
                .appendChild(el)
            styles.push(el)
        }

    }

    return styles
}

/** Go. 
 * 
 */
(() => {
    let d = null
    try {
        d = document
    } catch (e) {
        /** Running at the server.
         **/
        return
    }

    const callback = function (mutationsList) {

        for (let m of mutationsList) {
            walkNodes(m.addedNodes)
        }
    }

    const o = new MutationObserver(callback);

    o.observe(
        d.body,
        {
            attributes: true,
            childList: true,
            subtree: true
        }
    )

    /** Generate Styles For Initial Html 
     * */
    walkNodes(d.querySelectorAll('[class]'))

    d.body.style.visibility = 'visible'
})()
