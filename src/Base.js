/**
 *
 * TODO: Come up with better Configuration setting / getting.
 *
 **/

// tip from jQuery to speed up the time on undefined calls
var undefined = undefined,
    Jet = this.Jet = this.Jet ? this.Jet : {};

/**
 *
 **/
Jet.Extend = function(target, source){
    if(source === undefined){
        source = target;
        target = this;
    }
    
    for(var prop in source){
        // store a reference for quicker running.
        var tp = target[ prop ], sp = source[ prop ];

	    // Prevent never-ending loop
	    if ( tp === sp ) {
		    continue;
	    }

	    // Recurse if we're merging object values
	    if ( sp && typeof sp === "object" && !sp.nodeType) {
		    target[ prop ] = this.Extend(tp || ( sp.length != null ? [ ] : { } ), sp );

	    // Don't bring in undefined values
	    } else if ( sp !== undefined ) {
		    target[ prop ] = sp;
	    }
    }
    return target;
};

Jet.Extend({

    Config: {
        production: false,
        paths: {
            Jet: {
                uri: '__BASE__/',
                modules: {
                    Event: {
                        path: '../Event/'
                    }
                }
            }
        }
    },
    
//    Packages: ["Jet"],
    Namespaces: {"Jet": Jet},
    
    /**
     *
     **/
    Version: {
        release: 1,              //  The release, eg, in 1.5.6beta, this would be 1.
        major: 5,                //  The major release, eg, in 1.5.6beta, this would be 5.
        minor: 3,                //  The minor release, eg, in 1.5.6beta, this would be 6.
        flag: "experimental",           //  The release flag, eg, in 1.5.6beta, this would be 'beta'.
        build: "%build%",
        toString: function(){
            return this.release + "." + this.major + "." + this.minor + this.flag + (this.build != '%build%' ? " Build "+this.build : ''); // + " (rev " + revision + ")";
        }
    },
    
    /**
     *
     **/
    URI: {
        /**
         *
         **/
        Base: (function(){
            var result = document.location.href;
            if(document && document.getElementsByTagName){
                var scripts = document.getElementsByTagName("script");
                    
                for(var i=0, src, match, l=scripts.length; i<l; ++i){
                    src = scripts[i].getAttribute('src');
                    if(!src){
                        continue;
                    }
                    match = src.match(/(Jet|Base)?(\.min)?\.js/i);
                    
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
                
                for(var i=0, src, l=scripts.length; i<l; ++i){
                    src = scripts[i].getAttribute('src');
                    if(src){
                        result.push(src);
                    } else {
                        continue;
                    }
                }
            }
            return result;
        })(),

        Resolve: function(name){
            var nsc,
                JCp,
                uri   = this.Base,
                fname = [],
                ns    = name.split('.');
            
            if(Jet.Config && (JCp = Jet.Config.paths)){
                if(JCp[ns[0]] != undefined){
                    nsc = ns.shift();
                    uri = JCp[nsc].uri.replace(/(__BASE__\/)/, this.Base) || this.Base;
                    if(JCp[nsc].modules){
                        JCp = JCp[nsc].modules;
                        
                        for(var i = 0, l = ns.length; i<l; ++i){
                            nsc = ns[i];
                            if(JCp[nsc] && JCp[nsc].path){
                                uri += JCp[nsc].path;
                                fname = ['_core'];
                                JCp = JCp[nsc];
                            } else {
                                if(ns.length == i+1){
                                    fname.push(ns[i]);
                                } else {
                                    uri += nsc+'/';
                                }
                            }
                        }
                        fname = fname.join('.');
                    }
                } else {
                    fname = ns.join('.');
                }
            } else {
                fname = ns.join('.');
            }
            return uri + fname + (Jet.Config.production ? '.min.js' : '.js');
        }
    },
    
    /**
     *
     **/
    Root: (function(){
        if(document){
            if(document.getElementsByTagName){
                return document.getElementsByTagName('head')[0];
            } else {
                return document.body;
            }
        }
        return '';
    })()
});

//Jet.Namespaces['Jet'] = Jet;
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
        for(var node = null, nodes = name.split('.'); nodes.length;){
            node = nodes.shift();
            context = (context[ node ] = (context[ node ] == undefined) ? {/*_super: context*/} : context[ node ]);
        }
        return (this.Namespaces[name] = context);
    },
    
    /**
     * 
     **/
    Package: function(name, methods){
        var args = arguments.length;
        if(args == 0){
            return this;
        }
        
        if(args == 1){
            if(typeof name === 'object'){
                methods = name;
                name = 'Jet';
            } else {
                methods = {};
            }
        }
        this.Extend(this.Namespace(name), methods);
        //this.Provide(name);
        
        return this;
    },
    
    /**
     * 
     **
    Provide: function(name){
        if( ! this.Has(this.Packages, name)){
            this.Packages.push(name);
        }
        return this;
    },*/
    
    /**
     * 
     **/
    Require: function(namespace){
        if(namespace === undefined) {
            return this;
        }
        
        if(Object.prototype.toString.call(namespace) === '[object Array]'){
            for(var i in namespace){
                Jet.Require(namespace[i]);
            }
        } else {
            if( ! this.Has(this.Namespaces, namespace) ){
//            if( ! this.Has(this.Packages, namespace)){
                var uri = this.URI.Resolve(namespace);
                
                if( ! this.Has(this.URI.Loaded, uri)){
                    var http = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
                
                    http.open('GET', uri, false);
                    http.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                    http.setRequestHeader("Accept", "application/javascript,text/javascript,application/x-javascript");
                
                    try {
                        http.send(null);
                        if((http.status >= 200 && http.status < 300) || http.status == 304){
                            try{
                                this.Exec(";(function(Jet){"+http.responseText+"})(Jet);");
                            } catch(e){
                                this.Stop('Jet.Require failed to execute '+uri+'; Reason: '+e);
                            }
                            this.URI.Loaded.push(uri);
                        }
                    } catch(e){
    //                    this.Stop('Jet.Require failed to load '+uri+'; Reason: '+e);
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
        }
        return this;
    },
    
    /**
     * 
     **/
    Stop: function(){
        throw (Array.prototype.join.call(arguments, ' | '));
    },
    
    /**
     * 
     **/
    Has: function(haystack, needle){
        if(typeof haystack === 'object'){
            return !(haystack[needle] === undefined);
        }
        if(Array.prototype.indexOf){
            return Array.prototype.indexOf.call(haystack, needle) > -1 ? true : false;
        } else {
            // fallback to a loop if Array.prototype.indexOf isn't found:
            for ( var i = 0, n = haystack.length; i < n; ++i ) {
                if ( haystack[ i ] === needle ) {
                    return true;
                }
                continue;
            }
            return false;
        }
    },
    
    /**
     * Reinventing the Eval()
     **/
    Exec: (function(scriptFragment){
        var useText = true,
            root    = Jet.Root, // Has to use Jet.Root due to scope issue.
            script  = document.createElement('script'),
            sid     = 'Jet_script_' + (new Date).getTime();
        
        script.type = 'text/javscript';
        
        try {
    		script.appendChild( document.createTextNode( "Jet." + sid + "=1;" ) );
        } catch (e){}

        root.appendChild(script);
        root.removeChild(script);
        if ( window[ sid ] ) {
            useText = false;
    		delete Jet[ sid ];
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
