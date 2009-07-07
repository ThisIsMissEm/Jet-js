// tip from jQuery to speed up the time on undefined calls.
var undefined = undefined;

var Jet = this.Jet = this.Jet ? this.Jet : {
    Packages: ["Jet"],
    Namespaces: {},
    
    /**
     *
     **/
    Version: {
        release: 1,              //  The release, eg, in 1.5.6beta, this would be 1.
        major: 5,                //  The major release, eg, in 1.5.6beta, this would be 5.
        minor: 0,                //  The minor release, eg, in 1.5.6beta, this would be 6.
        flag: "alpha",           //  The release flag, eg, in 1.5.6beta, this would be 'beta'.
        toString: function(){
            return this.release + "." + this.major + "." + this.minor + this.flag; // + " (rev " + revision + ")";
        }
    },
    
    /**
     *
     **/
    URI: {
        Filename: /(j|J)et(\._base)?(\.min)?\.js/i,
        /**
         *
         **/
        Extension: '.js',
        
        /**
         *
         **/
        Base: (function(){
            var result = document.location.href;
            if(document && document.getElementsByTagName){
                var scripts = document.getElementsByTagName("script");
                var found = false;
                
                for(var i=0, l=scripts.length; i<l; ++i){
                    var src = scripts[i].getAttribute('src');
                    if(!src){
                        continue;
                    }
                    var match = src.match(this.Filename);
                    if(match){
                        result = src.substring(0, match.index);
                        break;
                    }
                }
            }
            return result;
        })(),
        
        /**
         *
         **/
        Loaded: (function(){
            var result = [];
            if(document && document.getElementsByTagName){
                var scripts = document.getElementsByTagName("script");
                for(var i=0, l=scripts.length; i<l; ++i){
                    var src = scripts[i].getAttribute('src');
                    if(src){
                        result.push(src);
                    } else {
                        continue;
                    }
                }
            }
            return result;
        })()
    },
    
    /**
     *
     **/
    Root: (function(){
        if(document && document.getElementsByTagName){
            return document.getElementsByTagName('head')[0];
        } else {
            return document.body;
        }
    })(),
    
    /**
     *
     **/
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
            context = (context[ node ] = (context[ node ] == undefined) ? {/*_super: context*/} : context[ node ]);
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
            }
        }
        this.Extend(this.Namespace(name), methods);
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
        if(name === undefined) {
            return;
        }
        
        if( ! this.inArray(name, this.Packages)){
            var uri = this.URI.Base + name + this.URI.Extension;
            
            if( ! this.inArray(uri, this.URI.Loaded)){
                var http = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
            
                http.open('GET', uri, false);
                http.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                http.setRequestHeader("Accept", "application/javascript,text/javascript");
            
                try {
                    http.send(null);
                    if((http.status >= 200 && http.status < 300) || http.status == 304){
                        try{
                            this.Exec(";(function(Jet){"+http.responseText+"})(Jet);");
                        } catch(e){
                            this.Stop('Jet.Require failed to load '+uri+'; Reason: '+e);
                        }
                        this.URI.Loaded.push(uri);
                    }
                } catch(e){
                    this.Stop('Jet.Require failed to load '+uri+'; Reason: '+e);
                }

/********************************************************************
 * Asychronous loader, means that it's non blocking.                *
 ********************************************************************

                var script = document.createElement("script");
                script.type = "text/javascript";
                if (script.readyState){  //IE
                    script.onreadystatechange = function(){
                        if (script.readyState == "loaded" || script.readyState == "complete"){
                            script.onreadystatechange = null;
                            if(arguments.length > 1 && typeof callback === 'function'){
                                callback.call(this.Namespace(name, window), null);
                            }
                            Jet.URI.Loaded.push(uri);
                            Jet.Root.removeChild(script);
                        }
                    };
                } else {  //Others
                    script.onload = function(){
                            if(arguments.length > 1 && typeof callback === 'function'){
                                callback.call(this.Namespace(name, window), null);
                            }
                            Jet.URI.Loaded.push(uri);
                            Jet.Root.removeChild(script);
                    };
                }
                script.src = uri;
                Jet.Root.appendChild(script);
                
 *********************************************************************/
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
    Exec: (function(scriptFragment){
        var useText = true,
            root    = Jet.Root, // Has to use Jet.Root due to scope issue.
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
	    
	    // Hopefully loosing memory in IE6
        root = script = sid = null;
        
        return function(scriptFragment){
            if(scriptFragment.length === 0){
                return;
            }
            
            var script = document.createElement('script'),
                root   = Jet.Root;
            
            if(!useText){
                script.appendChild(document.createTextNode(scriptFragment));
            } else {
                script.text = scriptFragment;
            }
            root.appendChild(script);
            root.removeChild(script);
            
       	    // Hopefully loosing memory in IE6
            root = script = useText = null;
        };
    })()
});
