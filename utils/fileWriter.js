const fs = require("fs");

const saveData = (receivedPackets, client) => {
    fs.writeFileSync("output.json", JSON.stringify(receivedPackets, null, 2));
    console.log("Data written to output.json");
    client.end();
};

module.exports = { saveData };