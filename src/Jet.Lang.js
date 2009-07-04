/**
 * Extends Jet to cover a few missing things in JavaScript
 *
 * @class       Lang
 * @extends     Jet
 * @namespace   Jet.Land
 **/

Jet.Package('Jet.Lang', {
    typeOf: function(){},
});

Jet.Package('Jet.Lang.Array', {
    indexOf: function(){},
    each: function(){},
    map: function(){},
    filter: function(){},
    toArray: function(){},
    
    //contains: Jet.inArray
});
Jet.Package('Jet.Lang.Object', {
            equal: function(){},
            hasKey: function(){},
            
            extend: Jet.Extend
});
Jet.Package('Jet.Lang.String', {
            trim: function(){},
            stripTags: function(){}
        });

/**
 * @namespace Jet.Lang.Array
 **
Jet.Package('Jet.Lang.Array', {
    /**
     * Check if a value exists in an Array
     * @argument    value   mixed   The value to check for.
     * @argument    source  array   The array to look in.
     * @returns             boolean The value exists in the array.
     **
    hasValue: function(value, source){
        for(var i = 0, sl = source.length; i<sl; ++i){
            if(value == source[sl]){
                return true;
            }
        }
        return false;
    },
    
    /**
     * Check if given source is an Array.
     * @argument    source  mixed   The source to check.
     * @returns             boolean The source an Array.
     **
    is: function(source){
        return Object.prototype.toString.call(source) === '[object Array]';
    },
    
    /**
     * Converts a given source into an Array.
     * @argument    iterable    mixed   The source to convert,
     * @returns                 array   The source as an Array.
     **
    iterable: function(iterable){
        var length  = iterable.length || 0,
        results = new Array(length);
        
        while (length--) results[length] = iterable[length];
        return results;
    },
    
    /**
     * Removes an Index from Source
     * @argument    index   mixed   The index to remove.
     * @argument    source  array   What to remove the index from.
     * @returns             array   Source minus the index we removed.
     **
    removeIndex: function(index, source){
        var to = 0;
        for(var i=0, sl=source.length; i<sl; i++){
            if(source[i]==index){
                to = i;
                break;
            }
        }
        var rest = source.slice(to + 1);
        source.length = to;
        return Array.prototype.push.apply(source, rest);
    }
});


/**
* @namespace Jet.Lang.Object
**
Jet.Package('Jet.Lang.Object', {
    /**
     * Check to see if two Objects are the same. (checks target against source)
     * @argument    target  object  The first object.
     * @argument    source  object  The second object.
     * @returns             boolean Are the objects the same?
     **
    equal: function(target, source){
        for(var key in target){
            if(target[key] != source[key] && ! (typeof target[key] == 'object' || typeof source[key] == 'object') ){
                return false;
            }
            if(typeof target[key] == 'object' || typeof source[key] == 'object'){
                return Jet.Lang.Object.equal(target[key], source[key] || {});
            }
        }
        return true;
    },
    
    /**
     * Check if a key is existent in an Object
     * @argument    key     string  The key to look for.
     * @argument    source  object  Where to look in.
     * @returns             boolean If the key exists.
     **
    hasKey: function(key, source){
        if(source[key] != undefined){
            return true;
        }
        return false;
    }
});
*/
