

;(function(){
    var undefined = undefined,

        Jet = this.Jet = this.Jet ? this.Jet : {},
        jet = this.jet = this.Jet;

    Jet.global = this;

    Jet.version = {
        release: 2,              //  The release, eg, in 1.5.6beta, this would be 1.
        major: 0,                //  The major release, eg, in 1.5.6beta, this would be 5.
        minor: 0,                //  The minor release, eg, in 1.5.6beta, this would be 6.
        flag: "experimental",           //  The release flag, eg, in 1.5.6beta, this would be 'beta'.
        build: "%build%",
        toString: function(){
            return [this.release, ".", this.major, ".", this.minor, ' ', this.flag, (this.build != '%build%' ? " Build "+this.build : '')].join('');
        }
    };

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




    Jet.config = Jet.config || {};
    Jet.mixin({}, Jet.config);

    Jet.mixin(Jet, {
        _toArray: function(source){
            return Array.prototype.slice.call(source, 0);
        },

        _has: function(haystack, needle){
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

        _baseURI: (function(){
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

        _resolver: function(){


        }
    });


    Jet.mixin(Jet, {
        _namespaces: {},
        _loaded: {},

        module: function(namespace, methods){


        },
        require: function(namespace){


        },
        use: function(){},

        execute: (function(ScriptFragment){
            var root = (document && document.getElementsByTagName('head')[0] || document && document.body) || false;

            if(root !== false){
                var useText = true,
                    script  = document.createElement('script'),
                    sid     = 'Jet_' + (new Date).getTime();

                script.type = 'text/javascript';

                try {
                    script.appendChild( document.createTextNode( "Jet." + sid + "=1;" ) );
                } catch (e){

                }

                root.appendChild(script);
                root.removeChild(script);

                if ( Jet[ sid ] ) {
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



    Jet.mixin(Jet, {
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
})();

