package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"servergpt/database"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	openai "github.com/sashabaranov/go-openai"
)

type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Photo string `json:"photo"`
}

type Response struct {
	Bot   string `json:"bot"`
	Limit *int   `json:"limit"`
}

type ReqBody struct {
	Prompt string `json:"prompt"`
	User   string `json:"user"`
}

var client *openai.Client
var reqBody ReqBody
var DB *database.Database

func main() {
	errLoad := godotenv.Load()
	if errLoad != nil {
		log.Fatal("Error loading .env file")
	}
	bdConnection()

	r := gin.Default()
	// Configuración de CORS
	r.Use(cors.Default())

	r.POST("/signin", callSignIn)
	r.POST("/davinci", callDavinci)
	r.POST("/dalle", callDalle)
	r.Run()
}

func callSignIn(c *gin.Context) {
	var user User
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

func callDavinci(c *gin.Context) {
	client = openai.NewClient(os.Getenv("OPENAI_API_KEY"))
	err := c.ShouldBindJSON(&reqBody)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cleanedPrompt := reqBody.Prompt

	if cleanedPrompt == "" {
		c.JSON(http.StatusBadRequest, gin.H{"statusText": "Missing required field \"prompt\" in request body"})
		return
	}

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: "you're an a AI assistant that replies to all my questions in markdown format.",
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: "hi",
				},
				{
					Role:    openai.ChatMessageRoleAssistant,
					Content: "Hi! How can I help you?",
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: cleanedPrompt + "?",
				},
			},
		},
	)

	if err != nil {
		fmt.Printf("ChatCompletion error: %v\n", err)
		return
	}

	c.JSON(http.StatusOK, Response{
		Bot:   resp.Choices[0].Message.Content,
		Limit: nil,
	})
}

func callDalle(c *gin.Context) {
	client = openai.NewClient(os.Getenv("OPENAI_API_KEY"))
	err := c.ShouldBindJSON(&reqBody)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := client.CreateImage(context.Background(), openai.ImageRequest{
		Prompt: reqBody.Prompt,
		N:      1,
		Size:   openai.CreateImageSize256x256,
		User:   reqBody.User,
	})

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	url := resp.Data[0].URL

	c.JSON(http.StatusOK, Response{
		Bot:   url,
		Limit: nil,
	})
}

func bdConnection() {
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
