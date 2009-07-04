/**
 * Extends Jet to provide access to Console.
 * @class       Console
 * @extends     Jet
 * @namespace   Jet.Console
 *
 * @todo        Possibly write in a custom error console, similar to Firebug Lite.
 **/
Jet.Package('Jet.Console', {
    log: function(){
        if( ! Jet.Production && typeof console === 'object' && console['log']){
            console.log(Array.prototype.join.call(arguments, ' '));
        }
    },
    warn: function(){
        if( ! Jet.Production && typeof console === 'object' && console['warn']){
            console.warn(Array.prototype.join.call(arguments, ' '));
        }
    },
    error: function(){
        if( ! Jet.Production && typeof console === 'object' && console['error']){
            console.error(Array.prototype.join.call(arguments, ' '));
        }
    }
});
