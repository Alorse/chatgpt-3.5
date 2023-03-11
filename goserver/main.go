package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	openai "github.com/sashabaranov/go-openai"
)

type Response struct {
	Bot   string `json:"bot"`
	Limit *int   `json:"limit"`
}

func main() {

	errLoad := godotenv.Load()
	if errLoad != nil {
		log.Fatal("Error loading .env file")
	}

	r := gin.Default()
	// Configuración de CORS
	r.Use(cors.Default())

	r.POST("/davinci", callGTP)
	r.Run()
}

func callGTP(c *gin.Context) {
	client := openai.NewClient(os.Getenv("OPENAI_API_KEY"))

	// Obtener los parámetros pasados por POST
	var reqBody struct {
		Prompt string `json:"prompt"`
		User   string `json:"user"`
	}
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
