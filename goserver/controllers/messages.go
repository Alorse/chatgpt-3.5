package controllers

import (
	"fmt"
	"log"
	"net/http"
	"servergpt/models"

	"github.com/gin-gonic/gin"
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

func GetMessagesByRoom(roomID string, limit int64, order_by string) ([]models.Message, error) {
	var messages []models.Message
	sql := `SELECT id, IF(user_id = '0', 1, 0) AS user_id, message_text, created_at 
			FROM messages 
			WHERE room_id = ? 
			ORDER BY created_at %s 
			LIMIT ?`
	sql = fmt.Sprintf(sql, order_by)
	rows, err := DB.GetConnection().Query(sql, roomID, limit)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var message models.Message
		err := rows.Scan(&message.ID, &message.UserID, &message.MessageText, &message.CreatedAt)
		if err != nil {
			log.Fatal(err)
			return nil, err
		}
		messages = append(messages, message)
	}

	if err := rows.Err(); err != nil {
		log.Fatal(err)
		return nil, err
	}

	return messages, nil
}

func ShowMessagesByRoom(c *gin.Context) {
	roomID := c.DefaultQuery("id", "0")
	var messages []models.Message
	messages, err := GetMessagesByRoom(roomID, 100, "ASC")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error2": err.Error()})
		return
	}
	c.JSON(http.StatusOK, messages)
}
