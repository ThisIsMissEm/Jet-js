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

    LoadedURIs: (function(){
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
Jet.Namespaces['Jet'] = Jet;
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
    
    MapURI: function(namespace, uri){
        if(typeof uri === 'string'){
            this.MappedURIs[namespace] = uri;
        }
        return this.MappedURIs[namespace] || namespace;
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
     
     /**

Alternative loader:

function loadScript(url, callback){

    var script = document.createElement("script");
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.body.appendChild(script);
}

**
    Require: function(name){
        if( ! this.inArray(originial_name, this.Packages))
        {
            var uri = this.BasePath + name;
            if(name.substr(name.length - 3, 3) !== '.js')
            {
                name = name.split('.');
                var nsDir = this.MapNamespace(name.shift());
            
            // swap our URI:
            uri = this.BasePath + nsDir + name.join('.') + (this.Production ? '.min.js' : '.js');
            }
        if( ! this.inArray(uri, this.LoadedPackages)){
        
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
        }}
    },
    */
    
    Require: function(name, callback){
    // Mustn't already exist.
        if(name !== undefined){
            if( ! this.inArray(name, this.Packages)){
                var uri = this.BasePath + name + (this.Production ? '.min.js' : '.js');
                if( ! this.inArray(uri, this.LoadedURIs)){
                
                // ***********************************************************************
                // START XHR METHOD
                // ***********************************************************************
                    //console.time('JetLoader');
                    
                    // We should be able to assume MSXML isn't to be used, due to a detection on browser environment previously.
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
                    /* This is the alternative method
                    var script = document.createElement("script");
                    script.type = "text/javascript";
                    if (script.readyState){  //IE
                        script.onreadystatechange = function(){
                            if (script.readyState == "loaded" || script.readyState == "complete"){
                                script.onreadystatechange = null;
                                if(arguments.length > 1 && typeof callback === 'function')
                                    callback.call(this.Namespace(name, window), null);
                                Jet.LoadedURIs.push(uri);
                            }
                        };
                    } else {  //Others
                        script.onload = function(){
                                if(arguments.length > 1 && typeof callback === 'function')
                                    callback.call(this.Namespace(name, window), null);
                                Jet.LoadedURIs.push(uri);
                        };
                    }
                    script.src = uri;
                    (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(script);
                    console.timeEnd('JetLoader');*/
                // ***********************************************************************
                // END XHR METHOD    
                // ***********************************************************************
                    
                }
            } else {
                if(arguments.length > 1 && typeof callback === 'function')
                    callback.call(this.Namespace(name, window), null);
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
     * Better scoping for evals.
     **/
    exec: function(scriptFragment){
        // TODO:
        // could I add in a document.createElement and appendage
        // of textNode  to it for better browser performance?
        
        return Jet.global.eval ? Jet.global.eval(scriptFragment) : eval(scriptFragment);
    }
});
