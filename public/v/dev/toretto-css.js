
import * as funcs from './toretto-funcs.js'
import { 
    _runtime, 
    parseClassName, 
    funcs as _funcs 
} from './toretto-funcs.js'

/** Todo: remove this later
 *  This is needed for migration purpose
 *  should be removed later
 */
Object.assign(funcs, _funcs)

const media = {
    '@md': '(min-width: 50rem) and (max-width: 100rem)',
    '@lg': '(min-width: 100rem)',
    '^md': '(min-width: 50rem)',
    '^lg': '(min-width: 100rem)',
}

/** Todo: remove this later
 *  @deprecated
 * */
const sizes = media

export const components = {

}

/** Check If Tagname Is Standart Or Custom.
 * 
 * */
export const isStandartTag = t => document.createElement(t) + '' !== '[object HTMLUnknownElement]'

/** EscapeClassName.
 * 
 */
export const escapeClassName = cn => {
    const p = cn.split(':')
    const pseudo = p[1] ? ':' + p.slice(1).join(':') : ''
    return cn.replace(/([()%@#:.^/]{1})/gi, '\\$1') + pseudo
}

/** Create Style Based On Class Name. 
 * 
 * */
export const createStyle = cn => {
    const tokens = parseClassName(cn.trim())
    const rawStyle = (funcs[tokens.func] || funcs.fallback)(
        tokens.func,
        ...tokens.props
    )
    const escapedName = escapeClassName(cn)
    let style = ''

    if (tokens.media && sizes[tokens.media])
        style = `@media screen and ${sizes[tokens.media]} { 
            .${escapedName} {
                ${rawStyle}
            }
        }`
    else if (tokens.media) 
        style = `.${tokens.media.substr(1)} .${escapedName} {
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
const _walkNodesCache = {
    ids: {},
}

export function walkNodes(nodes) {
    const styles = []

    for (let node of nodes) {

        if (components[node.tagName]) {

            const props = {
                children: node.innerHTML
            }
            for (let attr of node.attributes)
                props[attr.name] = attr.value
   
            const innerHTML = components[node.tagName](props).trim()

            const _el = document.createElement('div')            
            _el.innerHTML = innerHTML

            walkNodes(_el.querySelectorAll('*'))

            node
                .parentNode
                .replaceChild(_el.firstChild, node)
        }

        if (!node.className)
            continue

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
export const runToretto = (options = {}) => {
    _runtime.options = {
        ..._runtime.options,
        ...options
    }
    let d = null
    try {
        d = document
    } catch (e) {
        /** Running at the server.
         **/
        return
    }
    d.querySelectorAll('template').forEach(template => {
        template.id = template.id.toLowerCase()
        components[template.id.toUpperCase()] = (props) => {
            let htm = ''
            const expression = `htm=\`${template.innerHTML.trim()}\``
            eval(expression)
            return htm
        }
    })
    const cb = function (mutationsList) {
        for (let m of mutationsList) {
            walkNodes(m.addedNodes)
        }
    }
    const o = new MutationObserver(cb)
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
    walkNodes(d.body.querySelectorAll('*'))

    d.body.style.visibility = 'visible'
}