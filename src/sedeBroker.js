'use strict';

class SedeBroker {

    constructor(config = { }) {
        this.config = {
            warn: true,
            showAnnoyingWarning: true
        }

        this._count = 0;
        this._sequence = 0;
        this._subscribers = {};

        // merge with default options
        for(let key in config) {
            this.config[key] = config[key];
        }
        
        // show annoying warning
        if (this.config.warn && this.config.showAnnoyingWarning) {
            console.log('[SedeBroker]: Logging warnings when no one are subscribed for a published message.');
            console.log('[SedeBroker]: If you want to disable this behavior, set config.warn = false,');
            console.log('[SedeBroker]: or to disable just that tip set config.showAnnoyingWarning = false.');
        }
    }

    subscribe(proto, handler) {
        const id = this._sequence++;
        const broker = this;
        const ticket = {
            _proto : proto,
            _handler : handler,

            subscribe() {
                if (broker._subscribers[id]) {
                    return;
                }
                broker._subscribers[id] = this;
                broker._count++;
            },

            unsubscribe() {
                if (!broker._subscribers[id]) {
                    return;
                }
                delete broker._subscribers[id];
                broker._count--;
            }
        }
        
        ticket.subscribe();

        return ticket;
    }

    publish(message) {
        // Oh gosh! Really? 
        if (typeof message !== 'object') {
            throw Error(`The message must be an object!`);
        }

        // no one subscribed...
        if (this._count == 0 && this.config.warn) {
            console.log(`[SedeBroker]: No one subscribed for \'${message.constructor.name}\' message...`);
            return;
        }

        const shallow = this._subscribers;
        const errors = [];

        // keep it simple synchronous
        for (let id in shallow) {
            try {
                if (message instanceof shallow[id]._proto) {
                    shallow[id]._handler(message);
                }
            }
            catch(e) {
                errors.push({ 
                    ticket: shallow[id], 
                    message: message, 
                    error: e 
                });
            }
        }

        // please, promise me you will catch all errors!
        if (errors.length > 0) {
            throw errors;
        }
    }

    clear() {
        delete this._subscribers;
        this._subscribers = {}
        this._count = 0;
    }
}
