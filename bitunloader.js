module.exports = function(RED) {
    function BitUnloaderNode(config) {
        RED.nodes.createNode(this,config);
        this.padding = config.padding == "none" ? 0 : Number(config.padding);
        this.mode = config.mode;
        this.prop = config.prop;
        var node = this;
        this.on('input', function(msg,send,done) {
            send = send || function() { node.send.apply(node,arguments) };
            msg[this.prop] = Math.floor(msg[this.prop]);
            if (this.mode === "string") {
                msg[this.prop] = msg[this.prop].toString(2).padStart(this.padding,"0");
            } else if (this.mode === "arrayBits") { 
                msg[this.prop] = msg[this.prop].toString(2).padStart(this.padding,"0").split("").reverse();
                for (var i in msg[this.prop]) {
                    msg[this.prop][i] = Number(msg[this.prop][i]);
                }
            } else if (this.mode === "arrayBools") { 
                msg[this.prop] = msg[this.prop].toString(2).padStart(this.padding,"0").split("").reverse();
                for (var i in msg[this.prop]) {
                    msg[this.prop][i] = msg[this.prop][i] == '1' ? true : false;
                }
            } else if (this.mode === "objectBits") { 
                msg[this.prop] = msg[this.prop].toString(2).padStart(this.padding,"0").split("").reverse();
                let obj = {};
                for (var i in msg[this.prop]) {
                    obj[i] = Number(msg[this.prop][i]);
                }
                msg[this.prop] = obj;
            } else if (this.mode === "objectBools") { 
                msg[this.prop] = msg[this.prop].toString(2).padStart(this.padding,"0").split("").reverse();
                let obj = {};
                for (var i in msg[this.prop]) {
                    obj[i] = msg[this.prop][i] == '1' ? true : false;
                }
                msg[this.prop] = obj;
            }
            send(msg);
            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType("bitunloader",BitUnloaderNode);
}