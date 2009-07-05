var Jet = this.Jet = this.Jet ? this.Jet : {
    Production: false,
    Packages: ["Jet"],
    Namespaces: {},
/*    MappedURIs: {
        //  Default mapping for Jet. This is because we actually chop this off.
        'Jet.': 'Jet/'
    },*/
    
    Version: {
        release: 1,             //  The release, eg, in 1.5.6beta, this would be 1.
        major: 4,               //  The major release, eg, in 1.5.6beta, this would be 5.
        minor: 5,               //  The minor release, eg, in 1.5.6beta, this would be 6.
        flag: "beta",           //  The release flag, eg, in 1.5.6beta, this would be 'beta'.
        
// FIXME: No Revision tag since moving over to Git.
//        revision: (function(){  //  The svn/git revision getter.
//            var rev = "Rev: $id$".match(/\d+/);
//            return rev ? +rev[0] : NaN;
//        })(),
        
        toString: function(){
            with(this){
                return release + "." + major + "." + minor + flag; // + " (rev " + revision + ")";
            }
        }
    },
    
    URI: {
        Base: (function(){
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
        
        Loaded: (function(){
            var result = [];
            if(document && document.getElementsByTagName){
                var scripts = document.getElementsByTagName("script");
                for(var i=0, length = scripts.length; i<length; ++i){
                    var src = scripts[i].getAttribute('src');
                    if(!src){
                        continue;
                    } else {
                         result.push(src);
                    }
                }
            }
            return result;
        })(),
    },
    
    Root: (function(){
        return document.getElementsByTagName('head')[0];
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

// Prepopulate the namespaces with one scope, Jet, our own
Jet.Namespaces['Jet'] = Jet;

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
    Require: function(name, callback){
        if(arguments.length === 0) return; 
        
        if( ! this.inArray(name, this.Packages)){
            var uri = this.URI.Base + name + (this.Production ? '.min.js' : '.js');
            if( ! this.inArray(uri, this.URI.Loaded)){
            
/**
                var http = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
            
                http.open('GET', uri, false);
                http.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                http.setRequestHeader("Accept", "application/javascript,text/javascript");
            
                try {
                    http.send(null);
                    if((http.status >= 200 && http.status < 300) || http.status == 304){
                        try{
                            this.exec(";(function(Jet){"+http.responseText+"})(Jet);");
                            if(arguments.length > 1 && typeof callback === 'function')
                                callback.call(this.Namespace(name, window), null);
                        } catch(e){
                            this.Stop('Jet.Require failed to load '+uri+'; Reason: '+e);
                        }
                        this.LoadedURIs.push(uri);
                    }
                } catch(e){
                    this.Stop('Jet.Require failed to load '+uri+'; Reason: '+e);
                }
*/

                var script = document.createElement("script");
                script.type = "text/javascript";
                if (script.readyState){  //IE
                    script.onreadystatechange = function(){
                        if (script.readyState == "loaded" || script.readyState == "complete"){
                            script.onreadystatechange = null;
                            if(arguments.length > 1 && typeof callback === 'function')
                                callback.call(this.Namespace(name, window), null);
                            Jet.URI.Loaded.push(uri);
                            Jet.Root.removeChild(script);
                        }
                    };
                } else {  //Others
                    script.onload = function(){
                            if(arguments.length > 1 && typeof callback === 'function')
                                callback.call(this.Namespace(name, window), null);
                            Jet.URI.Loaded.push(uri);
                            Jet.Root.removeChild(script);
                    };
                }
                script.src = uri;
                Jet.Root.appendChild(script);
            }
        } else {
            if(arguments.length > 1 && typeof callback === 'function')
                callback.call(this.Namespace(name, window), null);
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
     * Reinventing the Eval()
     **/
    exec: (function(scriptFragment){
        var useText = true,
            root    = Jet.Root,
            script  = document.createElement('script');
            sid     = 'Jet_script_' + (new Date).getTime();
        
        script.type = 'text/javscript';
        
        try {
    		script.appendChild( document.createTextNode( "window." + sid + "=1;" ) );
        } catch (e){}

        root.appendChild(script);
        root.removeChild(script);
        if ( window[ sid ] ) {
            useText = false;
    		delete window[ sid ];
	    }
	    
        root = script = sid = null;
        
        return function(scriptFragment){
            if(scriptFragment.length === 0) return;
            var script = document.createElement('script'),
                root   = Jet.Root;
            if(!useText){
                script.appendChild(document.createTextNode(scriptFragment));
            } else {
                script.text = scriptFragment;
            }
            root.appendChild(script);
            root.removeChild(script);
            
            root = script = useText = null;
        };
    })()
});
