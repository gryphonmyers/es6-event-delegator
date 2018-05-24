module.exports = class EventDelegator {
    constructor(target, evtName) {
        Object.defineProperties(this, {
            evtName: { value: evtName },
            target: { value: target },
            listeners: { value: [] },
            callback: { value: this.delegateToListeners() }
        });
        this.target.addEventListener(this.evtName, this.callback);
    }

    delegateToListeners() {
        return function(evt, listener=null){
            var ii, listener, listeners = this.listeners;
            if (listener) {
                listeners = listeners.filter(item => item.listener === listener);
            }
            for (ii = 0; ii < listeners.length; ++ii) {
                listener = listeners[ii];
                var targets = [this.target];

                if (listener.query) {
                    try {
                        targets = Array.from(this.target.querySelectorAll(listener.query))
                            .filter(target => findParent.byMatcher(evt.target, el => el === target));
                    } catch (err) {
                        targets = [];
                    }
                }

                if (targets.length) {
                    targets.forEach(target => {
                        listener.func.call(listener.listener, {
                            originalEvent: evt, 
                            currentTarget: target, 
                            target: evt ? evt.target : null
                        });
                    })
                } else if (listener.noMatchFunc) {
                    listener.noMatchFunc.call(listener.listener, {
                        originalEvent: evt, 
                        currentTarget: null, 
                        target: evt ? evt.target : null
                    })
                }                
            }
        }.bind(this);
    }

    addListener(listener, query, func, noMatchFunc) {
        if (typeof query === 'function') {
            noMatchFunc = func;
            func = query;
            query = null;
        }

        if (!this.listeners.find(item => item.listener === listener)) {
            this.listeners.push({query, listener, func, noMatchFunc});
        }
    }

    removeListener(listener) {
        var ii = this.listeners.find(item => item.listener === listener);
        if (ii > -1) {
            this.listeners.splice(ii, 1)
        }
    }

    invoke(listener=null, evt=null) {
        this.callback.call(this, evt, listener);
    }
}