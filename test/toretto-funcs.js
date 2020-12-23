import test from 'ava'
import {
    knownPropsToKnownValues,
    parseClassName, groupProps
} from '../public/v/dev/toretto-funcs'
import browserEnv from 'browser-env'

browserEnv()

test('Parse class name.', t => {
    const className = 'margin-t1-solid-red@md:hover'
    const parsed = parseClassName(className)

    t.deepEqual(
        parsed,
        {
            func: 'margin',
            props: ['t1', 'solid', 'red'],
            media: '@md',
            pseudo: ['hover']
        }
    )
})

test('groupProps: should group array of props by type.', t => {
    const className = 'm-1-1-1-1-red-bold-unknown'
    const parsed = parseClassName(className)
    const grouped = groupProps(parsed.props)

    t.deepEqual(
        grouped,
        {
            v: [],
            h: [],
            x: [],
            y: [],
            t: [],
            r: [],
            b: [],
            l: [],
            numeric: ['1', '1', '1', '1'],
            colors: ['red'],
            known: ['bold'],
            unknown: ['unknown']
        }
    )
})

test('Conversion known props to known values.', t => {

    const result = knownPropsToKnownValues({
        'font-weight': ['bold', 'italic'],
        'border-style': ['solid'],
        'border-width': ['thin', 'medium', 'thik']
    })

    t.deepEqual(
        result,
        {
            bold: 'font-weight',
            italic: 'font-weight',
            solid: 'border-style',
            thin: 'border-width',
            medium: 'border-width',
            thik: 'border-width'
        }
    )

})