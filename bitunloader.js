module.exports = function (RED) {
    function BitUnloaderNode(config) {
        RED.nodes.createNode(this, config);
        this.padding = config.padding == "none" ? 0 : Number(config.padding);
        this.mode = config.mode;
        this.prop = config.prop;
        var node = this;
        this.on('input', function (msg, send, done) {
            send = send || function () {
                node.send.apply(node, arguments)
            };
            var p = parseInt(msg[this.prop]);
            if (msg[this.prop]) {
                if (!isNaN(p)) {
                    if (this.mode === "string") {
                        p = p.toString(2).padStart(this.padding, "0");
                    } else if (this.mode === "arrayBits") {
                        p = p.toString(2).padStart(this.padding, "0").split("").reverse();
                        for (var i in p) {
                            p[i] = Number(p[i]);
                        }
                    } else if (this.mode === "arrayBools") {
                        p = p.toString(2).padStart(this.padding, "0").split("").reverse();
                        for (var i in p) {
                            p[i] = p[i] == '1' ? true : false;
                        }
                    } else if (this.mode === "objectBits") {
                        p = p.toString(2).padStart(this.padding, "0").split("").reverse();
                        let obj = {};
                        for (var i in p) {
                            obj[i] = Number(p[i]);
                        }
                        p = obj;
                    } else if (this.mode === "objectBools") {
                        p = p.toString(2).padStart(this.padding, "0").split("").reverse();
                        let obj = {};
                        for (var i in p) {
                            obj[i] = p[i] == '1' ? true : false;
                        }
                        p = obj;
                    }
                    msg[this.prop] = p;
                    send(msg);
                    if (done) {
                        done();
                    }
                } else {
                    if (done) {
                        done({error:"Input is Not a Number",msg});
                    } else {
                        node.error("Input is Not a Number",msg);
                }
                }
            } else {
                if (done) {
                        done({error:`Property ${this.prop} is Undefined`,msg});
                    } else {
                        node.error(`Property ${this.prop} is Undefined`,msg);
                   }
            }                
        });
    }
    RED.nodes.registerType("bitunloader", BitUnloaderNode);
}
