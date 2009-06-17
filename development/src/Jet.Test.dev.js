/**
 * Extends Jet to provide a simple Test Suite.
 * 
 * @class       Test
 * @extends     Jet
 * @namespace   Jet.Test
 **/
 
Jet.Package('Jet.Test', {
    tests: {}
    
    module: function(){}
    run: function(){}
    
    assertTrue: function(){},
    assertFalse: function(){},
    
    assertEqual: function(){},
    assertNotEqual: function(){},
    
    assertError: function(){},
    assertFail: function(){},
});
