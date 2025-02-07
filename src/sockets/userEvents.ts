// src/sockets/userEvents.ts
import { Socket } from "socket.io";
import { CreateUserRequest, UserCreatedResponse, ErrorResponse } from '../types/user.types';

export default function registerUserEvents(socket: Socket) {
  socket.on("createUser", (data: CreateUserRequest) => {
    if (!data.name || data.name.trim() === "") {
      const error: ErrorResponse = { message: "Nom invalide" };
      socket.emit("error", error);
      return;
    }

    socket.data.username = data.name;
    
    const response: UserCreatedResponse = {
      id: socket.id,
      name: data.name
    };
    
    socket.emit("userCreated", response);
  });
}
