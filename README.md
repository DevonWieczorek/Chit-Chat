# Chit-Chat
Javascript framework for sending and receiving postMessages

@target - object, the targeted window/frame to post to
@targetOrigin - string, a specified URL for the window you're communicating with
              - you can allow all "\*" or you can specify a domain to restrict access 
@schema - JSON object, series of messageTypes and callbacks to be executed after the message event

### Creating the Object
Create a new instance of the Chat object in both the parent and the child window.
You can either specify a target origin to restrict permissions, or can pass a wild card to allow messages from any window.

Pass in your own message schema to associate different messageTypes with the handler functions to be executed. The message gets passed
into your callback function from the Chat object, so pass message in as your first argument if you need access to the message data in 
your function.

Parent:
```javascript
var frame = document.getElementById('frame').contentWindow;
var chit = new Chat(frame, '*', {
  greeting: function(message){
      console.log('Message received: ' + message[messageType]);
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
