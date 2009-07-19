

Jet.module('Jet.event', {
    _listener: {
        _getDispatcher: function(){
            return function(){
    			var ap=Array.prototype, c=arguments.callee, ls=c._listeners, t=c.target,
                    r = t && t.apply(this, arguments);
    
                for(var i=0, l=ls.length; i<l; ++i){
                    ls[i].apply(this, arguments);
                }
	    		// return value comes from original target function
	    		return r;
            };
        },
        
        add: function(/*Object*/source, /*String*/method, /*Function*/listener){
            source = source || Jet.global;
            
            var f = source[event];
            if(!f._listeners){
                var d = this._listener._getDispatcher();
                d.target = f;
                d._listeners = [];
                f = source[event] = d;
            }
            
            f._listeners.push(context[method]);
        }
    },
    connect: function(source, event, context, method){

    }
});
