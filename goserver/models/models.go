package models

import "time"

// Estructura para la tabla "messages"
type Message struct {
	ID          string
	UserID      string
	RoomID      string
	MessageText string
	CreatedAt   time.Time
}

// Estructura para la tabla "rooms"
type Room struct {
	ID        string
	UserID    string
	Name      string
	CreatedAt time.Time
}

type User struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	CreatedAt time.Time
}

type ReqBody struct {
	Prompt string  `json:"prompt"`
	User   string  `json:"user"`
	Room   *string `json:"room"`
}
