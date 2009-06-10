/**
 * @namespace   Jet
 * @author      Micheil Smith   micheil@yettobebranded.net
 *
 * @todo        Implement Lazy Loader
 * @todo        Write more test cases, using third party test runner.
 * @todo        Write up the examples for how to use it, and what it does.
 **/

;(function(){
    
    /**
     * A Simple way to access jet methods using namespacing.
     * @argument    ns     string|object    A valid namespace for Jet, eg, "Jet.Namespace"
     * @argument    *      mixed            All other arguments are passed on to the resolved Namespace if it is a function.
     * @returns            mixed            The resultant of the namespace. If the namespace resolves to a function, the function will be executed.
     **/
    var j = this.j = (this.j ? this.j : function(ns){
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
    });
    
    /**
     * @class   Jet
     * @namespace Jet
     **/
    var Jet = this.Jet = (this.Jet ? this.Jet : {
        /**
         * Set this to true when using in a Production environment, useful for debugging.
         **/
        Production: false,
        
        /**
         * A Simple Versioning Storage. This shouldn't be changed, except by a core contributor.
         **/
	version: {
            release: 1,             //  The release, eg, in 1.5.6beta, this would be 1.
            major: 3,               //  The major release, eg, in 1.5.6beta, this would be 5.
            minor: 0,               //  The minor release, eg, in 1.5.6beta, this would be 6.
            flag: "beta",           //  The release flag, eg, in 1.5.6beta, this would be 'beta'.
            revision: (function(){  //  The svn/git revision getter.
                var rev = "$Rev: 11 $".match(/\d+/);
                return rev ? +rev[0] : NaN;
            })(),
            
            /**
             * Check if the current Jet version is supplied version.
             * @argument    version     string      The version to check against, currently the version is "1.3.0beta".
             * @returns                 boolean     The current version is the supplied version.
             **/
            is: function(version){
                return (version === (this.release + "." + this.major + "." + this.minor + this.flag));
            },
            
            toString: function(){
                with(this){
                    return release + "." + major + "." + minor + flag + " (rev " + revision + ")";
                }
            }
	},
        
        // Storage Variables:
        _namespaces: {},
        _packages: [],
        
        /**
         * Kills a script from continue to be processed. Useful in loops, as well as in dependency based functions.
         * @argument 
         **/
        Die: function(msg){
            throw new Error((arguments.length > 0 ? msg : 'Died on Command')); 
        },
        
        /**
         * Copies items in Source into Target
         * @argument    source  object  What to copy from.
         * @argument    target  object  What to copy into. (optional, default: Jet/this)
         * @returns             object  The new object formed by copying source into target.
         **/
        Extend: function(target, source){
            if(arguments.length == 1){
                source = target;
                target = this;
            }
            
            for(var name in source){
                if(target[name] === undefined){
                    /*if(typeof source[name] == 'object'){
                        target[name] = {};
                        this.Extend(target[name], source[name]);
                    } */
                    target[name] = source[name];
                }
            }
            return target;
        },
        
        /**
         * Find an array index using string based notation
         * @argument   ns       string      The notation
         * @argument   scope    object      The scope of which we'd like to look within. (optional)
         * @returns             object      The final index within the array; array[index];
         **/
        Namespace: function(ns, scope, separator)
        {
            if(typeof ns === 'object'){
                return ns;
            }
            
            if(this._namespaces[ns] !== undefined)
                return this._namespaces[ns];
            
            scope = scope || window;
            
            if(typeof scope === 'string'){
                separator = scope;
                scope = window;
            } else {
                separator = separator || '.';
            }
            
            var nodes = ns.split(separator),
                n = null;
            for(;nodes.length;){
                n = nodes.shift();
                scope = (scope[n] = (scope[ n ] == undefined) ? {} : scope[n]);
            }
            return (this._namespaces[ns] = scope);
        },
        
        /**
         * Create a new package, or extend an existing one.
         * @argument   namespace   mixed    The namespace to use for this package.
         * @argument   methods     object   The methods to add to our package.
         * @returns                object   The new package.
         **/
        Package: function(namespace, methods)
        {
            namespace = namespace || 'Jet';
            methods = methods || {};
            if(arguments.length == 1 && name){
                methods = namespace;
                namespace = 'Jet';
            }
            this.Extend(this.Namespace(namespace, window), methods);
            this._packages.push(namespace);
            return this;
        },
        
        /**
         * Check if a named package is loaded.
         * @throws  Error   If package isn't found, throws an error to stop script execution.
         * 
         * @todo            Try to make this actually __autoload the package, will require lazyloader.
         **/
        Require: function(PackageName){
            if(!this._packages[PackageName]){
                throw new Error("Required Package '"+PackageName+"' not loaded."); 
            }
        }
    });
    
    /**
     * Extends Jet to provide access to Console.
     * @class       Console
     * @extends     Jet
     * @namespace   Jet.Console
     *
     * @todo        Possibly write in a custom error console, similar to Firebug Lite.
     **/
    Jet.Package('Jet.Console', {
        log: function(){
            if( ! Jet.Production && typeof console === 'object' && console['log']){
                console.log(Array.prototype.join.call(arguments, ' '));
            }
        },
        warn: function(){
            if( ! Jet.Production && typeof console === 'object' && console['warn']){
                console.warn(Array.prototype.join.call(arguments, ' '));
            }
        },
        error: function(){
            if( ! Jet.Production && typeof console === 'object' && console['error']){
                console.error(Array.prototype.join.call(arguments, ' '));
            }
        }
    });
    
    /**
     * Extends Jet to give a Publisher/Subscriber model.
     * @class       Jet
     * @extends     Jet
     * @namespace   Jet
     **/
    Jet.Extend({
        _topics: {},
        
        /**
         * A simpler way to execute all associated functions
         * @argument    topic   string  The topic to pull functions from.
         * @argument    args    array   Arguments to pass into the function when it is called.
         * @private
         **/
        _dispatcher: function(topic, args){
            var fns = this._topics[topic];
            for(var f=0, tl=fns.length; f<tl; ++f){
                fns[f].apply(this, args);
            }
        },
        
        /**
         * Publishes Args to all subscribers on Topic
         * @argument    topic   string   What publish to, can include a wildcard ( * ) at the end. Eg: "a:b:c:*" would work for both `a:b:c:d` and `a:b:c:z`.
         * @argument    args    array|string    What to sent to the Subscribers.
         **/
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
         * Subscribes to a topic.
         * @argument    topic   string      The topic to bind the method to.
         * @argument    method  function    The function to call when topic is published to.
         * @returns             array       A handle to later unsubscribe the method from the topic.
         * 
         * @todo Add Context.
         **/
        subscribe: function(topic, method /*, context*/){
            if(!this._topics[topic]){
                this._topics[topic] = [];
            }
            this._topics[topic].push(method);
            
            return [topic, this._topics[topic].length];
        },
        
        /**
         * Removes a method from a topic.
         * @argument    handle  array   A predefined handle, usually given from Jet.subscribe, but can look like ['test:test:*', 0], which will remove the first method from the 'test:test:*' topic.
         **/
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
     * @class       Lang
     * @extends     Jet
     * @namespace   Jet.Land
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
     * @class       Profiler
     * @extends     Jet
     * @namespace   Jet.Profiler
     **/
    Jet.Package('Jet.Profiler', {
        
        /**
         * Profiles a given function for the given number of iterations
         * @argument    job         function    The function to profile.
         * @argument    iterations  int         The number of times to run the function
         * @argument    description string      The description of the profiler (optional)
         **/
        "do": function (job, iterations, description) {
            description = description || job.toString();
            
            var start = new Date();
            for(var i = 0; i < iterations; ++i) {
                job.call(window, i);
            }
            var end   = new Date();
            return (end.getTime() - start.getTime());
        },
        
        /**
         * Runs through a series of profiles.
         * @argument    profiles    object  A correct object for Jet Profiler.
         * @see                     Profiling/Jet.Profiler.syntax.obj.js
         **/
        run: function(profiles, callback){
            var profiler = this;
            for(var profile in profiles){
                profiles[profile].time = (function(profile){
                    if(typeof profile.does === 'function'){
                        return profiler.do(profile.does, profile.count ? profile.count : 100);
                    }
                    return -1;
                })(profiles[profile]);
            }
            if(typeof callback === 'function'){
                callback.call(null, profiles);
            }
            return profiles;
        }
    });
    
    
    /**
     * Extends Jet to provide a simple Test Suite.
     * 
     * @class       Test
     * @extends     Jet
     * @namespace   Jet.Test
     **/
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
         **/
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
         **/
        isType: function(actual, expected, description){
            description = description || 'Test';
            return this._log((typeof actual === expected), description);
        },
        
        /**
         * Is a given condition true?
         * @argument    actual      mixed   The actual value to test.
         * @argument    unexpected  mixed   The unexpected value.
         * @argument    description string  A short message that defines what the test does.
         **/
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
         **/
        notType: function(actual, unexpected, description){
            description = description || 'Test';
            return this._log((typeof actual !== unexpected), description);
        },
        
        /**
         * Is a given condition true?
         * @argument    condition   boolean The condition we are testing.
         * @argument    description string  A short message that defines what the test does.
         **/
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
    
    
})();
