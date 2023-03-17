package controllers

import (
	"log"
	"net/http"
	"servergpt/models"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateNewRoom(reqBody models.ReqBody) (string, error) {
	if reqBody.Room == nil {
		sql := `INSERT INTO rooms(id, user_id, name) VALUES (?, ?, ?)`
		args := []interface{}{}
		roomID := generateRoomID()
		args = append(args, roomID)
		args = append(args, reqBody.User)
		args = append(args, "Nameless")

		rows, err := DB.GetConnection().Query(sql, args...)
		if err != nil {
			return "", err
		}
		defer rows.Close()

		return roomID, nil
	} else {
		return *reqBody.Room, nil
	}
}

func generateRoomID() string {
	id, _ := uuid.NewRandom()
	return id.String()
}

func UpdateRoom(roomID string, name string) bool {
	sql := `UPDATE rooms SET name = ? WHERE id = ?`

	rows, err := DB.GetConnection().Query(sql, cleanTitle(name), roomID)
	if err != nil {
		log.Fatal(err)
		return false
	}
	defer rows.Close()
	return true
}

func cleanTitle(str string) string {
	// Reemplazamos los caracteres de espacio en blanco con un espacio en blanco normal
	cleanStr := strings.ReplaceAll(str, "\t", " ")
	cleanStr = strings.ReplaceAll(cleanStr, "\n", " ")
	cleanStr = strings.ReplaceAll(cleanStr, "\r", " ")
	cleanStr = strings.ReplaceAll(cleanStr, "\"", "")
	// Eliminamos los espacios en blanco adicionales dejados por los reemplazos anteriores
	cleanStr = strings.Join(strings.Fields(cleanStr), " ")

	return cleanStr
}

func getRoomsByUser(userID string) ([]models.Room, error) {
	var rooms []models.Room
	sql := `SELECT id, name, created_at FROM rooms WHERE user_id = ? LIMIT 100`
	rows, err := DB.GetConnection().Query(sql, userID)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var room models.Room
		err := rows.Scan(&room.ID, &room.Name, &room.CreatedAt)
		if err != nil {
			log.Fatal(err)
			return nil, err
		}
		rooms = append(rooms, room)
	}

	if err := rows.Err(); err != nil {
		log.Fatal(err)
		return nil, err
	}
	return rooms, nil
}

func ShowRoomsByUser(c *gin.Context) {
	userID := c.DefaultQuery("id", "0")
	var rooms []models.Room
	rooms, err := getRoomsByUser(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error2": err.Error()})
		return
	}
	c.JSON(http.StatusOK, rooms)
}
