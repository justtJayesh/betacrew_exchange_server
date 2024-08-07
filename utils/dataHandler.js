const { saveData } = require("./fileWriter");
const receivedPackets = [];
const receivedSequences = new Set();

const handleData = (data) => {
    try {
        // Check if data is long enough
        if (data.length < 17) {
            console.error("Received data is too short:", data);
            return;
        }

        // Extract packet details
        const symbol = data.toString("ascii", 0, 4);
        const buysellindicator = data.toString("ascii", 4, 5);
        const quantity = data.readInt32BE(5);
        const price = data.readInt32BE(9);
        const packetSequence = data.readInt32BE(13);

        // Process unique packets
        if (!receivedSequences.has(packetSequence)) {
            const packet = { symbol, buysellindicator, quantity, price, packetSequence };
            receivedPackets.push(packet);
            receivedSequences.add(packetSequence);
            console.log("Received packet:", packet);
        }

        // Save data if all sequences are received
        if (receivedSequences.size === receivedPackets.length) {
            saveData(receivedPackets, client);
        }
    } catch (error) {
        console.error("Error processing data:", error);
    }
};

const requestMissingPackets = (client) => {
    const missingSequences = [];
    const lastSequence = Math.max(...Array.from(receivedSequences));

    // Identify missing sequences
    for (let i = 1; i < lastSequence; i++) {
        if (!receivedSequences.has(i)) {
            missingSequences.push(i);
        }
    }

    // Request missing packets if any
    if (missingSequences.length > 0) {
        console.log("Requesting missing packets:", missingSequences);
        missingSequences.forEach((seq) => {
            const buffer = Buffer.alloc(2);
            buffer.writeUInt8(2, 0); // callType 2 for "Resend Packet"
            buffer.writeUInt8(seq, 1); // sequence number to resend
            client.write(buffer);
        });
    } else {
        console.log("No missing packets detected.");
        saveData(receivedPackets, client);
    }
};

module.exports = { handleData, requestMissingPackets };