const { createConnection } = require("./utils/connection");
const { requestMissingPackets, handleData } = require("./utils/dataHandler");

const client = createConnection();

client.on("data", (data) => {
    handleData(data, client);
});

client.on("end", () => {
    requestMissingPackets(client);
});

client.on("error", (err) => console.error("Connection error:", err.message));

client.on("close", () => console.log("Connection closed"));
