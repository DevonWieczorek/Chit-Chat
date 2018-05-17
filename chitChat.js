// Simple framework for communicating between parent and children windows
// Create your own message types and handlers, and build new handlers on the fly
// @target - the targeted window/frame to post to
// @targetOrigin - a specified URL for the window you're communicating with
//               - you can allow all "*" or you can specify to restrict

function Chat(target, targetOrigin, schema){
    var chat = this;

    this.schema = schema || {};

    this._sendableFunc = function(func){
        // Remove double spaces and line breaks, then stringify
        var clean = func.toString().replace(/(?:\r\n|\r|\n)/g, '');
        clean = clean.replace(/\s+/g,' ');
        clean = JSON.stringify(clean);

        // Remove extra quotes
        if(clean.charAt(0) == '"') clean = clean.slice(1,clean.length);
        if(clean.charAt(clean.length - 1) == '"') clean = clean.slice(0,-1);

        return clean;
    }

    // Convert schema to an array that can be sent in a postMessage
    this._schemaArr = function(schema){
        var arr = [];
        var keys = Object.keys(schema).length;

        for(var i = 0; i < keys; i++){
            var mType = Object.keys(schema)[i];
            var mFunc = chat._sendableFunc(schema[mType]);
            arr.push({messageType: mType, function: mFunc});
        }

        return arr;
    }

    this._delegate = function(event){
        // Reject potential malicious postMessages if all origins not allowed
        if(targetOrigin !== '*' && event.origin !== targetOrigin){
            event.source.postMessage('ERROR: You do not have permission to post to this window.', event.origin);
            return false;
        }

        // Decode and parse the message
        var message = (event.data) ? JSON.parse(event.data) : {blank: ''};
        var messageType = Object.keys(message)[0];
        var messageContent = message[messageType];

        // Allow for native message functions
        switch(messageType){
            case 'log':
                console.log(messageContent);
                break;

            case 'warning':
                console.warn(messageContent);
                break;

            case 'error':
                console.error(messageContent);
                break;

            case 'schema':
                console.log(message);
                break;

            case 'append':
                var args = messageContent;
                chat.appendToSchema(args[0], args[1]);
                break;

            case 'blank':
                console.warn('The message received was either blank or improperly formatted.');
                break;

            default:
                // If the related function exists, call it
                if(typeof chat.schema[messageType] === 'function'){
                    // Pass the message in to the callback so the data can be used
                    var tempFunc = chat.schema[messageType];
                    tempFunc(message);
                }

                // Otherwise warn the other window that it does not exist
                else{
                    // Allow schemas to be passed back and forth with no error
                    messageType = messageType.toLowerCase();
                    if(messageType !== 'blank'){
                        chat.send({warning: 'ERROR: There is no function defined for "' + messageType + '" in your schema. Please use Chat.appendToSchema(messageType, callback) to add it.'});
                    }
                }
        }
    }

    this.appendToSchema = function(messageType, callback){
        // Will overwrite if messageType already exists
        if(typeof callback === 'function'|| typeof callback === 'object'){
            chat.schema[messageType] = callback;
        }
        else{
            var args = callback.split('(')[1].split(')')[0];
            var func = callback.split('{')[1].split('}')[0];
            chat.schema[messageType] = new Function(args, func);
        }

        chat.send({schema: chat._schemaArr(chat.schema)});
    }

    this.send = function(message){
        target.postMessage(JSON.stringify(message), targetOrigin);
    }

    this.listen = (function(){
        // Cross Browser Implmementation
        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        var eventFunction = window[eventMethod];
        var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

        eventFunction(messageEvent, chat._delegate);
    }());
}
