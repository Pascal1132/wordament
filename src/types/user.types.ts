export interface User {
  id: string;
  name: string;
}

// Events Requests
export interface CreateUserRequest {
  name: string;
}

// Events Responses
export interface UserCreatedResponse {
  id: string;
  name: string;
}

export interface ErrorResponse {
  message: string;
  code?: string;
} 