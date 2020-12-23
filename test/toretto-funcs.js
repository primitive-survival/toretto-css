import test from 'ava'
import { knownPropsToKnownValues } from '../public/v/dev/toretto-funcs'

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