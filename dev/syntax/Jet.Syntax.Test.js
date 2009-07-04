var tests = {
    "description": {
        arguments: [],
        content: window,
        expected: null,
        actual: null,
        ok: false,
        does: function(){ return 0; }
    }
}




Jet.Test.module('Jet._base').test({
    expect: 7,
    tests: {
        "Array.push()": function(){ return this.ok( Array.prototype.push) },
	    "Function.apply()": function(){ return this.ok( Function.prototype.apply)},
	    "getElementById": function(){ return this.ok( document.getElementById)},
	    "getElementsByTagName": function(){ return this.ok( document.getElementsByTagName)},
        "RegExp": function(){ return this.ok( RegExp)}
    }
});
