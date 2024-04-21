// __mocks__/identity-obj-proxy.js

module.exports = new Proxy({}, {
    get: function (target, key) {
        return key;
    }
});
