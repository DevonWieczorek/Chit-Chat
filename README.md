# Chit-Chat
Javascript framework for sending and receiving postMessages

@param target {window} - Window or iFrame you are instantiating in

@param targetOrigin {string} - URL of the window you're communicating with (you can allow all "*" or you can specify to restrict to specific URLs)

@param schema {JSON object} - series of messageTypes and callbacks to be executed after the message event

### Creating the Object
Create a new instance of the Chat object in both the parent and the child window.
You can either specify a target origin to restrict permissions, or can pass a wild card to allow messages from any window.

Pass in your own message schema to associate different messageTypes with the handler functions to be executed. The message gets passed
into your callback function from the Chat object, so pass message in as your first argument if you need access to the message data in 
your function.

Parent:
```javascript
var frame = document.getElementById('frame').contentWindow;

var chat = new Chat(frame, '*', {
  greeting: function(message){
      console.log('Message received: ' + message['greeting']);
  }
});
```

Child:
```javascript
var chat = new Chat(window.parent, '*', {
  greeting: function(message){
      chat.send({response: 'Hey there!'});
  }
});
```
Any subsequent messaging code on the parent end should be wrapped in the child's load event:
```javascript
$('#frame').load(function(){
    chat.send({greeting: 'Welcome to the party, pal!'});
});
```

### Designing Your Schema
Message schemas should be a JSON object that contains single key-value pairs. They can be stored as a variable and then passed into
your Chat object, or they can be passed directly as an argument. The message received is passed into the functions by default, so just
pass in the message as an argument to access them.
```javascript
var schema = {
    greeting: function(message){
        chat.send({response: 'Oh, hey there!'});
    },
    response: function(message){
        console.log('Message received: ' + message['response']);
    }
}

var chat = new Chat(window.parent, '*', schema);
```
```javascript
var chat = new Chat(window.parent, '*', {action: function(){ doAction(); }});
```

### Sending Messages
Once your instance of the Chat object has been created, you can use the send() function to pass a message to the other window.
That window's schema will dictate how the message is handled.
```javascript
var chat = new Chat(window.parent, '*', schema);
chat.send({message: 'I am here now!'});
```

### Updating Your Schema
You can update your schema programmatically by using your object's appendToSchema() method which takes two arguments, the
messageType and the callback to be executed when that messageType is received.
```javascript
chat.appendToSchema('newMessageType', function(message){
    doSomethingWith(message['newMessageType']);
});
```

### Native Message Types
The Chat object comes with several 'native' messageTypes which will trigger different functionality.

First, the three main console methods are included:
```javascript
chat.send({log: 'log me'}); // logs the message in the receivers console
chat.send({warn: 'watch out!'}); // logs a warning message in the receivers console
chat.send({error: 'uh oh...'}); // logs an error message in the receivers console
```

The 'append' messageType will trigger the appendToSchema() method on the receiving end. 
The message data should contain an array with two values, a string with the new messageType, and the function 
to be called (as a string).

** Note: If the messageType already exists in the receiver's schema, that callback will be overridden. (messageTypes are always
converted to lower case internally).
```javascript
var func = function(str){console.log(str);};
chat.send({append: ['funcName', func.toString()]});
```

Once the receiver's schema is updated, it sends back a message with the updated schema as an array:
```javascript
chat.send({schema: schemaArray});
```

Our last native messageType is (you guessed it) 'schema', which logs the received schemaArray.
```javascript
/* 
{schema: [
    {
      messageType: 'messageType1', 
      function: 'func1(arg){ doStuff(); }'
    },
    {
      messageType: 'messageType2', 
      function: 'func2(arg){ doOtherStuff(); }'
    }
]}
*/
```
### RawGit Link
```html
<script type="text/javascript" src="https://cdn.rawgit.com/DevonWieczorek/Chit-Chat/master/chitChat.js"></script>
```
