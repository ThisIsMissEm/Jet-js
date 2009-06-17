
var Jet = this.Jet = {
    initialized: false,
    Production: false,
    Packages: [],
    LoadedPackages: [],
    Namespaces: {},
    NamespaceMappings: {
        //  Default mapping for Jet. This is because we actually chop this off.
        'Jet': 'Jet.'
    },
    
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
            var found = false;
            
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
    
    Initialize: function(){
        if(!this.initialized){
            if(document && document.getElementsByTagName){
                var scripts = document.getElementsByTagName("script");
                for(var i=0, length = scripts.length; i<length; ++i){
                    var src = scripts[i].getAttribute('src');
                    if(!src){
                        continue;
                    } else {
                         this.LoadedPackages.push(src);
                    }
                }
            }
            this.initialized = true;
        }
    },
    
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
    
    MapNamespace: function(namespace, uri){
        if(typeof uri === 'string'){
            this.NamespaceMappings[namespace] = uri;
        }
        return this.NamespaceMappings[namespace] || namespace;
    },
    
    /**
     * 
     **/
    Package: function(name, methods){
        this.Initialize();
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
        this.Initialize();
        if( ! this.inArray(name, this.Packages)){
            this.Packages.push(name);
        }
        return this;
    },
    
    /**
     * 
     **/
    Require: function(name){
        var originial_name = name;
       
        var uri = this.BasePath + name;
        
        if(name.substr(name.length - 3, 3) !== '.js'){
            name = name.split('.');
            var nsDir = this.MapNamespace(name.shift());
            
            // swap our URI:
            uri = this.BasePath + nsDir + name.join('.') + (this.Production ? '.min.js' : '.js');
        }
        if( ! this.inArray(uri, this.LoadedPackages) || ! this.inArray(originial_name, this.Packages)){
        
            var http = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
        
            http.open('GET', uri, false);
            http.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            http.setRequestHeader("Accept", "application/javascript,text/javascript");
        
            try {
                http.send(null);
                if((http.status >= 200 && http.status < 300) || http.status == 304){
                    try{
                        this.eval("(function(Jet){"+http.responseText+"})(Jet);");
                    } catch(e){
                        this.Stop('Jet.Require failed to load '+uri+'; Reason: '+e);
                    }
                    this.LoadedPackages.push(uri);
                    console.log(this.LoadedPackages);
                                        console.log(this.Packages);
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
        console.error((typeof msg !== undefined ? msg : 'Died on Command')); 
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
});
