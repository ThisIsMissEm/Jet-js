/**
* Extends Jet to give a Publisher/Subscriber model.
* @class       Jet
* @extends     Jet
* @namespace   Jet
**/

Jet.Package('Jet.Event', {
    topics: {},
    /**
     * Publishes Args to all subscribers on Topic
     * @argument    topic   string   What publish to, can include a wildcard ( * ) at the end. Eg: "a:b:c:*" would work for both `a:b:c:d` and `a:b:c:z`.
     * @argument    args    array|string    What to sent to the Subscribers.
     **/
    publish: function(topic, args){
        if(Object.prototype.toString.call(args) !== '[object Array]'){
            args = [args];
        }
        
        /**
         * A simpler way to execute all associated functions
         * @argument    topic   string  The topic to pull functions from.
         * @argument    args    array   Arguments to pass into the function when it is called.
         * @private
         **/
        function dispatcher(topic, args){
            var fns = this._topics[topic];
            for(var f=0, tl=fns.length; f<tl; ++f){
                fns[f].apply(this, args);
            }
        }
        
        for(var e in this.topics){
            if(e === topic){
                dispatcher(e, args);
            } else if(topic.charAt(topic.length-1) === '*' && topic.substr(0, topic.length-1) === e.substr(0, topic.length-1)){
                dispatcher(e, args);
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
        if(!this.topics[topic]){
            this.topics[topic] = [];
        }
        this.topics[topic].push(method);
        
        return [topic, this.topics[topic].length];
    },
    
    /**
     * Removes a method from a topic.
     * @argument    handle  array   A predefined handle, usually given from Jet.subscribe, but can look like ['test:test:*', 0], which will remove the first method from the 'test:test:*' topic.
     **/
    unsubscribe: function(handle){
        if(this.topics[handle[0]]){
            if(this.topics[handle[0]][handle[1]]){
                delete this.topics[handle[0]][handle[1]];
            }
            delete this.topics[handle[0]];
        }
    }
});
