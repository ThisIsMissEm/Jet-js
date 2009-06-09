
Jet.Test.ok( a == a, 'a is a as a is as');

Jet.Test.is( a, a, 'a is a');
Jet.Test.not( a, b, 'a is not b');

Jet.Test.isType( 'test', 'string', 'test is a string');
Jet.Test.notType( 'test', 'function', 'test is not a function');

Jet.Test.like('foole', /^foo/, 'foo is like fooble')

