/* @flow */
import test from 'ava'
import greeting from 'sidelifter'

test('exporting "Hello World!"', t => {
  t.is(greeting, 'Hello World!')
})
