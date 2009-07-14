



;(function(){
    var undefined = undefined,
        
        Jet = this.Jet = this.Jet ? this.Jet : {},
        jet = this.jet = this.Jet;
    
    
    Jet.global = this;

    Jet._mixin = function(obj, props){
        // so we don't copy Object.prototype methods.
        var tobj = {};
        
        for(var x in props){
            if(tobj[x] === undefined || tobj[x] != props[x]){
                obj[x] = props[x];
            }
        }
        return obj;
    };
    
    Jet.mixin = function(obj, props){
        obj = obj || {};
        for(var i=1, l = arguments.length;  i<l; ++i){
            Jet._mixin(obj, arguments[i]);
        }
        return obj;
    };
    
    Jet.mixin(Jet, {
        version: {
            release: 2,              //  The release, eg, in 1.5.6beta, this would be 1.
            major: 0,                //  The major release, eg, in 1.5.6beta, this would be 5.
            minor: 0,                //  The minor release, eg, in 1.5.6beta, this would be 6.
            flag: "experimental",           //  The release flag, eg, in 1.5.6beta, this would be 'beta'.
            build: "%build%",
            toString: function(){
                return [this.release, ".", this.major, ".", this.minor, this.flag, (this.build != '%build%' ? " Build "+this.build : '')].join('');
            }
        },
        
        uri: {
            base: (function(){
                var result = '';
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
            
            loaded: (function(){
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
            
            resolve: function(ns){
                if(ns){
                    ns = ns.replace(/\.+$/, '');
                    var uri = [], _uri;
                
                    for(var i=0, nodes = ns.split('.'), nl = nodes.length; i < nl; ++i){
                        if(i == nl - 1){
                            _uri = uri.join('/');
                            return [(_uri ? _uri+'/' : ''), nodes[i], '.js'].join('');
                        } else {
                            uri.push(nodes[i]);
                        }
                    }
                }
            }
        }
    });

    Jet.mixin(Jet, {
        has: function(haystack, needle){
            if(typeof haystack === 'object'){
                return !(haystack[needle] === undefined);
            } else {
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
            }
        },
        
        hitch: function(scope, method){
            if(!method){
            	method = scope;
            	scope = null;
            }
                    
            if(typeof method == "string"){
            	scope = scope || Jet.global;
            	if(! scope[method]){
				    throw(['Jet.hitch: scope["', method, '"] is null (scope="', scope, '")'].join(''));
            	}
            	return function(){
            		return scope[method].apply(scope, arguments || []);
            	};
            }
            return ! scope ? method : function(){
            	return method.apply(scope, arguments || []);
            };
        }
    });
    
    Jet.mixin(Jet, {
        namespaces: {'Jet': Jet},
    
        package: function(ns, methods){
            if(ns){
            	if(typeof ns == "object"){
            		methods = ns;
	            	ns = Jet.global;
    	        }
            
    	        this.mixin(this.namespace(ns), methods || {});
            }
	        return this;
        },
        
        namespace: function(ns, scope){
            if(typeof ns == "object"){
            	return ns;
            } else if(this.has(this.namespaces, ns)){
            	return this.namespaces[ns];
            }
            
            scope = scope || Jet.global;
            for(var node = null, nodes = ns.split('.'); nodes.length;){
            	node = nodes.shift();
            	scope = (scope[node] = (scope[node] == undefined ? {} : scope[node]));
            }
            return (this.namespaces[ns] = scope);
        },

        _require: function(ns){
            if(typeof ns == "string"){
                if( ! this.has(this.namespaces, ns)){
                	var uri = this.uri.resolve(ns);
                	
                	if( ! this.has(this.loaded, uri)){
                	    var http = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
                
                        http.open('GET', this.uri.base+uri, false);
                        http.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                        http.setRequestHeader("Accept", "application/javascript,text/javascript,application/x-javascript");
                        
                        try {
                            http.send(null);
                            
                            if((http.status >= 200 && http.status < 300) || http.status == 304){
                                try{
                                    this.Exec(";(function(Jet){"+http.responseText+"})(Jet);");
                                } catch(e){
                                    this.Stop('Jet.Require failed to execute '+ns+'; Reason: '+e);
                                }
                                this.uri.loaded.push(uri);
                            }
                        } catch(e){
                            this.Stop('Jet.require failed to load '+ns+'; Reason: '+e);
                        }
                	}
                }
            }
        },
        
        require: function(ns){
            for(var i=0, l=arguments.length; i<l; ++i){
                this._require(arguments[i]);
            }
            return this;
        },
        
        Exec: (function(scriptFragment){
            var root    = (document && document.getElementsByTagName('head')[0] || document && document.body) || false;
            
            if(root !== false){
                var useText = true,
                    script  = document.createElement('script'),
                    sid     = 'Jet_script_' + (new Date).getTime();
                    
                script.type = 'text/javscript';
                
                try {
                    script.appendChild( document.createTextNode( "Jet." + sid + "=1;" ) );
                } catch (e){
                
                }
                
                root.appendChild(script);
                root.removeChild(script);
                
                if ( window[ sid ] ) {
                    useText = false;
                    delete Jet[ sid ];
                }
                
                script = sid = null;
                
                return function(scriptFragment){
                    if(scriptFragment.length === 0){
                        return;
                    }
                    
                    var script = document.createElement('script');
                    
                    if(!useText){
                        script.appendChild(document.createTextNode(scriptFragment));
                    } else {
                        script.text = scriptFragment;
                    }
                    
                    root.appendChild(script);
                    root.removeChild(script);
                    
                    root = script = useText = null;
                };
            } else {
                return function(scriptFragment){
                    if(scriptFragment.length === 0){
                        return;
                    }
                    Jet.global.eval ? Jet.global.eval(scriptFragment) : eval(scriptFragment);
                };
            }
        })()
    });
})();
