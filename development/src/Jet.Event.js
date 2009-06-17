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
