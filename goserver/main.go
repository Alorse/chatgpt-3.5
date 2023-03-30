package main

import (
	"log"

	"servergpt/controllers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	errLoad := godotenv.Load()
	if errLoad != nil {
		log.Fatal("Error loading .env file")
	}

	controllers.DBConnection()

	r := gin.Default()
	// Configuración de CORS
	r.Use(cors.Default())

	r.POST("/signin", controllers.SignIn)
	r.POST("/davinci", controllers.CreateChatCompletion)
	r.POST("/dalle", controllers.CreateImage)
	r.GET("/get-rooms", controllers.ShowRoomsByUser)
	r.GET("/get-messages", controllers.ShowMessagesByRoom)
	r.DELETE("/delete-room/:id", controllers.RemoveRoom)
	r.Run()
}
