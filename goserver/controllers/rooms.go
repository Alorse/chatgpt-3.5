package controllers

import (
	"log"
	"servergpt/models"
	"strings"

	"github.com/google/uuid"
)

func CreateNewRoom(reqBody models.ReqBody) (string, error) {
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
