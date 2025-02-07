"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerUserEvents;
function registerUserEvents(socket) {
    socket.on("createUser", (data) => {
        if (!data.name || data.name.trim() === "") {
            const error = { message: "Nom invalide" };
            socket.emit("error", error);
            return;
        }
        socket.data.username = data.name;
        const response = {
            id: socket.id,
            name: data.name
        };
        socket.emit("userCreated", response);
    });
}
