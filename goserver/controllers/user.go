package controllers

import (
	"log"
	"net/http"
	"os"
	"servergpt/database"
	"servergpt/models"

	"github.com/gin-gonic/gin"
)

var DB *database.Database

func SignIn(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sql := `SELECT COUNT(*) FROM users WHERE id = ?;`
	var count int
	err := DB.GetConnection().QueryRow(sql, user.ID).Scan(&count)
	if err != nil {
		log.Fatal(err)
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User already exists"})
		return
	}

	sql = `INSERT INTO users (id, email, name) VALUES (?, ?, ?);`

	args := []interface{}{}
	args = append(args, user.ID)
	args = append(args, user.Email)
	args = append(args, user.Name)

	rows, err := DB.GetConnection().Query(sql, args...)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func DBConnection() {
	DB = database.NewDatabase(
		"mysql",
		os.Getenv("DB_DATABASE"),
		os.Getenv("DB_USERNAME"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"))
	errConnecton := DB.Connect()
	if errConnecton != nil {
		log.Printf("Could not connect to database: %s", errConnecton)
		os.Exit(11)
	} else {
		var test string
		err2 := DB.GetConnection().QueryRow("SELECT COUNT(*) FROM users").Scan(&test)
		if err2 != nil {
			log.Printf("Could not connect to database: %s", err2)
			os.Exit(11)
		}
		log.Printf("Connected to database successfully")
	}
}
