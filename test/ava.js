import test from 'ava'
import { func1 } from '../public/v/dev/toretto-lib'
import { 
    knownProps, 
    knownPropsToKnownValues 
} from '../public/v/dev/toretto-funcs'

test('Ava Test', t => {
	typeof func1 === 'function' ? t.pass() : t.fail()
});

