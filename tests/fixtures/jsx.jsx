import foo from 'foo'
import foo2 from 'foo/foo'
import foo3 from '@foo/foo'
import foo4 from '@foo/foo/foo'
import * as foo5 from 'foo-foo'
import { foo6 } from 'foo.foo'
import foo7 from './foo2'
import foo8 from '@/foo2'
import foo9 from '#foo2'

const bar = require('bar')
const bar2 = require('bar/bar')
const bar3 = require('@bar/bar')
const bar4 = require('@bar/bar/bar')
const bar5 = require('./bar2')

const baz = import('baz')
const baz2 = import('baz/baz')
const baz3 = import('@baz/baz')
const baz4 = import('@baz/baz/baz')
const baz5 = import('./baz')
