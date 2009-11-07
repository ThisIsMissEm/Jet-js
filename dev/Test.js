/**
 * Extends Jet to provide a simple Test Suite.
 * 
 * @class       Test
 * @extends     Jet
 * @namespace   Jet.Test
 **/
Jet.Package('Jet.Test', {
    module: function(module){
        var self = this;
        var test = {
            module: module,
            expected: 0,
            actual: 0,
            tests: [],
            report: [],
            
            
            test: function(options){
                this.expected = options['expect'];
                this.tests = options['tests'];
                return this;
            },
            
            run: function(){
                var count = 0;
                for(var t in this.tests){
                    ++count;
                    this.report.push('Testing: '+t+"...");
                    if(!!this.tests[t].call(this, [])){
                        ++this.actual;
                        this.report.push('Passed\n');
                    } else {
                        this.report.push('Failed\n');
                    }
                }
                
                if(count !== this.expected){
                    console.error("Error:  "+this.module+": Mismatch in test count.");
                } else {
                    console[this.actual === this.expected ? 'warn': 'error']((this.actual === this.expected ? "Passed: " : "Failed: ")+this.module+" ("+this.actual+"/"+this.expected+")\n-------------------------------------------\n"+this.report.join(''));
                }
                
                return this;
            }
        };
        
        for(var m in Jet.Test){
            if(test[m] !== Jet.Test[m] && m !== 'module'){
                test[m] = Jet.Test[m];
            }
        }
        
        return test;
        
    },
    
    ab: function(a, b, args){
        var self    = this,
            args    = args || [];
            
        var results = this.compare(
            (function(){
                var start = new Date();
                a.apply(window, args);
                var stop = new Date();
                
                Jet.Test.log('a: ', stop - start);
                
                return stop - start;
            })(), 
            (function(){
                var start = new Date();
                b.call(window, args);
                var stop = new Date();
                
                Jet.Test.log('b: ', stop - start);
                
                return stop - start;
            })()
        );
        
        if(results === true){
            this.log('b is faster');
        } else if(results === false){
            this.log('a is faster');
        } else {
            this.log('equal');
        }
    },
    
    assert: function(){
    
    },
    
    compare: function(a, b){
        if(a > b){
            return true;
        } else if(a < b){
            return false;
        } else {
            return 0;
        }
    },
    
    ok: function(){
        return true;
    },
    
    log: function(){
        console.log(Array.prototype.join.call(arguments, ''));
    }
    
});

    /**
     * Extends Jet to provide a simple Test Suite.
     * 
     * @class       Test
     * @extends     Jet
     * @namespace   Jet.Test
     *//*/
    Jet.Package('Jet.Test', {
        
        _log: function(is, description){
            if(is){
                Jet.Console.log("Test Passed: ", description);
                return true;
            } else {
                Jet.Console.error("Test Failed: ", description);
                return false;
            }
        },
        
        /**
         * Is a given condition true?
         * @argument    actual      mixed   The actual value to test.
         * @argument    expected    mixed   The expected value.
         * @argument    description string  A short message that defines what the test does.
         *//*/
        is: function(actual, expected, description){
            description = description || 'Test';
            if(typeof actual === 'object'){
                return this._log((Jet.Lang.Object.equal(actual, expected)), description);
            } else {
                return this._log((actual == expected), description);
            }
        },
        
        /**
         * Is a given condition true?
         * @argument    actual      mixed   The actual value to test.
         * @argument    expected    mixed   The expected type of value.
         * @argument    description string  A short message that defines what the test does.
         *//*/
        isType: function(actual, expected, description){
            description = description || 'Test';
            return this._log((typeof actual === expected), description);
        },
        
        /**
         * Is a given condition true?
         * @argument    actual      mixed   The actual value to test.
         * @argument    unexpected  mixed   The unexpected value.
         * @argument    description string  A short message that defines what the test does.
         *//*/
        not: function(actual, unexpected, description){
            description = description || 'Test';
            if(typeof actual === 'object'){
                return this._log(( ! Jet.Lang.Object.equal(actual, unexpected)), description);
            } else {
                return this._log((actual != unexpected), description);
            }
        },
        
        /**
         * Is a given condition true?
         * @argument    actual      mixed   The actual value to test.
         * @argument    unexpected  mixed   The unexpected type of value.
         * @argument    description string  A short message that defines what the test does.
         *//*/
        notType: function(actual, unexpected, description){
            description = description || 'Test';
            return this._log((typeof actual !== unexpected), description);
        },
        
        /**
         * Is a given condition true?
         * @argument    condition   boolean The condition we are testing.
         * @argument    description string  A short message that defines what the test does.
         *//*/
        ok: function(condition, description){
            description = description || 'Test';
            return this._log(condition === true, description);
        },
        
        run: function(tests){
            var tester = this;
            for(var test in tests){
                (function(test, description){
                    test = Jet.Extend( test, {
                        arguments: [],
                        content: window,
                        expected: null,
                        actual: null,
                        ok: false,
                        does: null
                    });
                    
                    if(typeof test.does === 'function'){
                        test.actual = test.does.apply(test.context, test.arguments);
                        test.ok = tester.is(test.expected, test.actual, description);
                    }
                })(tests[test], test);
            }
            
            if(typeof callback === 'function'){
                callback.call(null, tests);
            }
            return tests;
        }
    });
    */
