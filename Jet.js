/**
 * @namespace   Jet
 * @author      Micheil Smith   micheil@yettobebranded.net
 **/

;(function(){
    
    this.j = function(ns){
        var jns = Jet.Namespace(ns);
        if(typeof jns == 'function'){
            var args = [];
            for(var i=1, a=arguments.length; i<a ; ++i){
                args.push(arguments[i]);
            }
            return jns.call(this, args);
        } else {
            return jns;
        }
    };
    
    /**
     * @class   Jet
     * @namespace Jet
     **/
    var Jet = this.Jet = (this.Jet ? this.Jet : {
        _namespaces: {},
        _packages: [],

        /**
         * Find an array index using string based notation
         * @argument   ns       string      The notation
         * @argument   scope    object      The scope of which we'd like to look within. (optional)
         * @returns             object      The final index within the array; array[index];
         **/
        Namespace: function(ns)
        {
            if(typeof ns === 'object'){
                return ns;
            }
            
            if(this._namespaces[ns] !== undefined)
                return this._namespaces[ns];

            var scope = (arguments[1] && typeof arguments[1] === 'object') ? arguments[1] : window;
            
            var separator = (typeof arguments[1] === 'string') ?
                                arguments[1] : (typeof arguments[2] === 'string') ?
                                    arguments[2] : '.';
            
            var nodes = ns.split(separator),
                n = null;
            for(;nodes.length;){
                n = nodes.shift();
                scope = (scope[n] = (scope[ n ] == undefined) ? {} : scope[n]);
            }
            return (this._namespaces[ns] = scope);
        },
        
        /**
         * Copies items in Source into Target
         * @todo Document Further.
         **/
        Extend: function(source){
            var target = this;
            
            if(arguments.length > 1){
                target = arguments[0];
                source = arguments[1];
            }
            
            for(var name in source){
                if(target[name] === undefined){
                    /*if(typeof source[name] == 'object'){
                        target[name] = {};
                        this.Extend(target[name], source[name]);
                    } else {*/
                        target[name] = source[name];
                    //}
                }
            }
            return target;
        },
        
        /**
         * Create a new package, or extend an existing one.
         * @argument   namespace   mixed    The namespace to use for this package.
         * @argument   methods     object   The methods to add to our package.
         * @argument   scope       mixed    The namespace to use as a parent scope. (optional)
         * @returns                object   The new package.
         **/
        Package: function()
        {
            var namespace = ((typeof arguments[0] == 'string' || arguments.length > 1) ? arguments[0] : 'Jet');

            var methods = (typeof arguments[0] == 'object' && arguments.length == 1 ? arguments[0] :
                (arguments.length > 1 && typeof arguments[1] == 'object' ? arguments[1] : {}));
            
            this.Extend(this.Namespace(namespace, window), methods);
            
            this._packages.push(namespace);
            
            return this;
        },
        
        Require: function(PackageName){
            if(!this._packages[PackageName]){
                throw new Error("Required Package '"+PackageName+"' not loaded."); 
            }
        }
    });
    
    
    /**
     * Extends Jet to give a Publisher/Subscriber model.
     * @extends Jet
     * @namespace Jet
     **/
    Jet.Extend({
        _topics: {
            'test:test*': [
                // this fires on test:test:test and test:test:a etc.
                function(){
                    console.log('tam? ', arguments);
                }
            ],
            'test:test:*': [
                // this fires on test:test:test and test:test:a etc.
                function(){
                    console.log('tame ', arguments);
                }
            ],
            'test:test:test': [
                function(msg){
                    console.log('wild ', arguments);
                }
            ]
        },
        
        _dispatcher: function(t, args){
            var topic = this._topics[t];
            for(var f=0, tl=topic.length; f<tl; ++f){
                topic[f].apply(this, args);
            }
        },
        
        publish: function(topic, args){
            if(Object.prototype.toString.call(args) !== '[object Array]'){
                args = [args];
            }
            
            for(var e in this._topics){
                if(e === topic){
                    this._dispatcher(e, args);
                } else if(topic.charAt(topic.length-1) === '*' && topic.substr(0, topic.length-1) === e.substr(0, topic.length-1)){
                    this._dispatcher(e, args);
                }
            }
            
            return this;
        },
        /**
         * @todo Add Context.
         **/
        subscribe: function(topic, method /*, context*/){
            if(!this._topics[topic]){
                this._topics[topic] = [];
            }
            this._topics[topic].push(method);
            
            return [topic, this._topics[topic].length];
        },
        unsubscribe: function(handle){
            if(this._topics[handle[0]]){
                if(this._topics[handle[0]][handle[1]]){
                    delete this._topics[handle[0]][handle[1]];
                }
                delete this._topics[handle[0]];
            }
        }
    });
    
    /**
     * Extends Jet to cover a few missing things in JavaScript
     * 
     * @class   Lang
     * @extends Jet
     * @namespace Jet.Land
     **/
    Jet.Package('Jet.Lang', {
        
        /**
         * @namespace Jet.Lang.Array
         **/
        Array: {
            /**
             * Check if a value exists in an Array
             * @argument    value   mixed   The value to check for.
             * @argument    source  array   The array to look in.
             * @returns             boolean The value exists in the array.
             **/
            hasValue: function(value, source){
                for(var i = 0, sl = source.length; i<sl; ++i){
                    if(value == source[sl]){
                        return true;
                    }
                }
                return false;
            },
            
            /**
             * Check if given source is an Array.
             * @argument    source  mixed   The source to check.
             * @returns             boolean The source an Array.
             **/
            is: function(source){
                return Object.prototype.toString.call(source) === '[object Array]';
            },
            
            /**
             * Converts a given source into an Array.
             * @argument    iterable    mixed   The source to convert,
             * @returns                 array   The source as an Array.
             **/
            iterable: function(iterable){
                var length  = iterable.length || 0,
                    results = new Array(length);
                
                while (length--) results[length] = iterable[length];
                return results;
            },
            
            /**
             * Removes an Index from Source
             * @argument    index   mixed   The index to remove.
             * @argument    source  array   What to remove the index from.
             * @returns             array   Source minus the index we removed.
             **/
            removeIndex: function(index, source){
                var to = 0;
                for(var i=0, sl=source.length; i<sl; i++){
                    if(source[i]==index){
                        to = i;
                        break;
                    }
                }
                var rest = source.slice(to + 1);
                source.length = to;
                return Array.prototype.push.apply(source, rest);
            }
        },
        
        
        /**
         * @namespace Jet.Lang.Object
         **/
        Object: {
            /**
             * Check to see if two Objects are the same. (checks target against source)
             * @argument    target  object  The first object.
             * @argument    source  object  The second object.
             * @returns             boolean Are the objects the same?
             **/
            equal: function(target, source){
                for(var key in target){
                    if(target[key] != source[key] && ! (typeof target[key] == 'object' || typeof source[key] == 'object') ){
                        return false;
                    }
                    if(typeof target[key] == 'object' || typeof source[key] == 'object'){
                        return Jet.Lang.Object.equal(target[key], source[key] || {});
                    }
                }
                return true;
            },
            
            /**
             * Check if a key is existent in an Object
             * @argument    key     string  The key to look for.
             * @argument    source  object  Where to look in.
             * @returns             boolean If the key exists.
             **/
            hasKey: function(key, source){
                if(source[key] != undefined){
                    return true;
                }
                return false;
            }
        }
    });
    
    
    /**
     * Extends Jet to provide a Simple Profiler
     * 
     * @class   Profiler
     * @extends Jet
     * @namespace Jet.Profiler
     **/
    Jet.Package('Jet.Profiler', {
        
        /**
         * Profiles a given function for the given number of iterations
         * @argument    job         function    The function to profile.
         * @argument    iterations  int         The number of times to run the function
         * @argument    description string      The description of the profiler (optional)
         **/
        run: function (job, iterations) {
            var description = arguments.length > 2 ? arguments[2] : job.toString();
            var start = new Date();
            for(var i = 0; i < iterations; ++i) {
                job.call(window, i);
            }
            var end   = new Date();
            console.log("Profiler: " +iterations + " iterations of " + description + " took " + (end.getTime() - start.getTime()) + " milliseconds.");
            return (end.getTime() - start.getTime());
        }
    });
    
    
    /**
     * Extends Jet to provide a simple Test Suite.
     * 
     * @class   Test
     * @extends Jet
     * @namespace Jet.Test
     **/
    Jet.Package('Jet.Test', {
        /**
         * Logs a message to the console
         * @private
         **/
        _log: function(is, description){
            console[is ? 'warn' : 'error']((is ? 'Passed: ' : 'Failed: ') + description);
        },
        
        /**
         * Is a given condition true?
         * @argument    actual      mixed   The actual value to test.
         * @argument    unexpected  mixed   The unexpected value.
         * @argument    description string  A short message that defines what the test does.
         **/
        not: function(actual, unexpected, description){
            if(typeof actual === 'object'){
                this._log(!Jet.Lang.Object.equal(actual, unexpected), description);
            } else {
                this._log(actual != unexpected, description);
            }
        },
        
        /**
         * Is a given condition true?
         * @argument    actual      mixed   The actual value to test.
         * @argument    unexpected  mixed   The unexpected type of value.
         * @argument    description string  A short message that defines what the test does.
         **/
        notType: function(actual, unexpected, description){
            this._log(typeof actual !== unexpected, description);
        },
        
        /**
         * Is a given condition true?
         * @argument    condition   boolean The condition we are testing.
         * @argument    description string  A short message that defines what the test does.
         **/
        ok: function(condition, description){
            this._log(condition === true, description);
        },
        
        /**
         * Is a given condition true?
         * @argument    actual      mixed   The actual value to test.
         * @argument    expected    mixed   The expected value.
         * @argument    description string  A short message that defines what the test does.
         **/
        is: function(actual, expected, description){
            if(typeof actual === 'object'){
                this._log(Jet.Lang.Object.equal(actual, expected), description);
            } else {
                this._log(actual == expected, description);
            }
        },
        
        /**
         * Is a given condition true?
         * @argument    actual      mixed   The actual value to test.
         * @argument    expected    mixed   The expected type of value.
         * @argument    description string  A short message that defines what the test does.
         **/
        isType: function(actual, expected, description){
            this._log(typeof actual === expected, description);
        }
    });
    
    
})();