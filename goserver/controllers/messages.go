package controllers

import (
	"servergpt/models"

	"github.com/google/uuid"
)

func CreateNewMessage(reqBody models.ReqBody) (string, error) {
	sql := `INSERT INTO messages(id, user_id, room_id, message_text) VALUES (?, ?, ?, ?)`
	args := []interface{}{}
	messageID := generateMessageID()
	args = append(args, messageID)
	args = append(args, reqBody.User)
	args = append(args, reqBody.Room)
	args = append(args, reqBody.Prompt)

	rows, err := DB.GetConnection().Query(sql, args...)
	if err != nil {
		return "", err
	}
	defer rows.Close()

	return messageID, nil
}

func generateMessageID() string {
	id, _ := uuid.NewRandom()
	return id.String()
}
