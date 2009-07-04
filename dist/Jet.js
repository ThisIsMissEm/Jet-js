/**
 * @namespace   Jet
 * @author      Micheil Smith   micheil@yettobebranded.net
 *
 * @todo        Implement Lazy Loader
 * @todo        Write more test cases, using third party test runner.
 * @todo        Write up the examples for how to use it, and what it does.
 **/

;(function(){
    if( ! this.Jet){
        
var Jet = this.Jet = {
    
    Production: false,
    Packages: [],
    Namespaces: {},
    
    Version: {
        release: 1,             //  The release, eg, in 1.5.6beta, this would be 1.
        major: 4,               //  The major release, eg, in 1.5.6beta, this would be 5.
        minor: 5,               //  The minor release, eg, in 1.5.6beta, this would be 6.
        flag: "beta",           //  The release flag, eg, in 1.5.6beta, this would be 'beta'.
        revision: (function(){  //  The svn/git revision getter.
            var rev = "$Rev: 12 $".match(/\d+/);
            return rev ? +rev[0] : NaN;
        })(),
        
        toString: function(){
            with(this){
                return release + "." + major + "." + minor + flag + " (rev " + revision + ")";
            }
        }
    },
    
    BasePath: (function(){
        var result = document.location.href;
        if(document && document.getElementsByTagName){
            var scripts = document.getElementsByTagName("script");
            var src_regex = /(j|J)et(\._base)?(\.min)?\.js/i;
            
            for(var i=0, length = scripts.length; i<length; ++i){
                var src = scripts[i].getAttribute('src');
                if(!src){
                    continue;
                }
                var match = src.match(src_regex);
                if(match){
                    result = src.substring(0, match.index);
                    break;
                }
            }
        }
        return result;
    })(),
    
    Extend: function(target, source){
        if(source === undefined){
            source = target;
            target = this;
        }
        
        for(var name in source){
            if(target[name] === undefined){
                target[name] = source[name];
            }
        }
        return target;
    }
};


/**
 * A Reference to the global scope
 **/
Jet.global = this;

/**
 * The main Jet methods.
 **/
Jet.Extend({
    /**
     * 
     **/
    Namespace: function(name, context){
        if(typeof name === 'object'){
            return name;
        } else if(this.Namespaces[name] !== undefined){
            return this.Namespaces[name];
        }
        
        context = context || window;
        var nodes = name.split('.'),
            node = null;
        for(;nodes.length;){
            node = nodes.shift();
            context = (context[ node ] = (context[ node ] == undefined) ? {} : context[ node ]);
        }
        return (this.Namespaces[name] = context);
    },
    
    /**
     * 
     **/
    Package: function(name, methods){
        if(arguments.length == 1){
            if(typeof name === 'object'){
                methods = name;
                name = 'Jet';
            } else {
                methods = {};
                name = name;
            }
        }
        this.Extend(this.Namespace(name, window), methods);
        this.Provides(name);
        
        return this;
    },
    
    /**
     * 
     **/
    Provides: function(name){
        if( ! this.inArray(name, this.Packages)){
            this.Packages.push(name);
        }
        return this;
    },
    
    /**
     * 
     **/
    Require: function(name){
        if( ! this.inArray(name, this.Packages)){
            var uri = this.BasePath + name + (this.Production ? '.min.js' : '.js');
            var http = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
            
            http.open('GET', uri, false);
            
            try {
                http.send(null);
                if((http.status >= 200 && http.status < 300) || http.status == 304){
                    try{
                        this.eval("(function(Jet){"+http.responseText+"})(Jet);");
                    } catch(e){
                        this.Stop('Jet.Require failed to load '+uri+'; Reason: '+e);
                    }
                }
            } catch(e){
                this.Stop('Jet.Require failed to load '+uri+'; Reason: '+e);
            }
        }
    },
    
    /**
     * 
     **/
    Stop: function(msg){
        throw new Error((arguments.length > 0 ? msg : 'Died on Command')); 
    },
    
    /**
     * 
     **/
    With: function(namespace, callback){
        Jet.Require(namespace);
        callback.call(this.Namespace(namespace, window), null);
    },
    
    /**
     * 
     **/
    inArray: function(elem, array){
        for ( var i = 0, length = array.length; i < length; ++i ) {
	    if ( array[ i ] === elem ) {
                return true;
            }
        }
        return false;
    },
    
    /**
     * 
     **/
    eval: function(scriptFragment){
        return Jet.global.eval ? Jet.global.eval(scriptFragment) : eval(scriptFragment);
    }
});/**
 * Extends Jet to cover a few missing things in JavaScript
 *
 * @class       Lang
 * @extends     Jet
 * @namespace   Jet.Land
 **/

Jet.Provides('Jet.Lang');

/**
 * @namespace Jet.Lang.Array
 **/
Jet.Package('Jet.Lang.Array', {
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
});


/**
* @namespace Jet.Lang.Object
**/
Jet.Package('Jet.Lang.Object', {
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
});
/**
* Extends Jet to give a Publisher/Subscriber model.
* @class       Jet
* @extends     Jet
* @namespace   Jet
**/
Jet.Package('Jet.Event', {
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
    } else {
        var Jet = this.Jet;
    }
})();
