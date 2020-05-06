# Sede Broker

Just a simple message broker.

## Instantiate a new broker

```javascript
const broker = new SedeBroker()
```

## Specify your messages

```javascript
class HelloMessage {
    constructor(name) {
        this._name = name
    }

    get name() {
        return this._name
    }
}
```

## Subscribe

```javascript
const ticket = broker.subscribe(HelloMessage, message => {
    console.log(`Hello ${message.name}!`)
})
```

## Publish

```javascript
broker.publish(new HelloMessage('World'))
```

## Unsubscribe

```javascript
ticket.unsubscribe()
```

## Resubscribe

```javascript
ticket.subscribe()
```

## Remove all subscriptions

```javascript
broker.clear()
```

## Update message with backward compatibility

```javascript
// add optional arguments (keep safe)
class HelloMessageV2 extends HelloMessage {
    constructor(name, greeting = 'Hello') {
        super(name)
        this._greeting = greeting        
    }

    get greeting() {
        return this._greeting
    }
}

// transform all new instances of HelloMessage to HelloMessage2
HelloMessage = HelloMessageV2

// you don't need to change old subscribers (services)
const oldSystem = broker.subscribe(HelloMessage, message => {
    console.log(`Hello ${message.name}!`)
})

// and you can write new ones
const newSystem = broker.subscribe(HelloMessageV2, message => {
    console.log(`${message.greeting} ${message.name}!`)
})

// dont need to change old producers
broker.publish(new HelloMessage('World'))

// and you can write new ones as well ;)
broker.publish(new HelloMessageV2('World', 'Hi'))
```
