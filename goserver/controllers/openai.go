package controllers

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	openai "github.com/sashabaranov/go-openai"
)

type Response struct {
	Bot   string `json:"bot"`
	Limit *int   `json:"limit"`
}

type ReqBody struct {
	Prompt string `json:"prompt"`
	User   string `json:"user"`
}

var reqBody ReqBody
var client *openai.Client

func CreateChatCompletion(c *gin.Context) {
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

func CreateImage(c *gin.Context) {
	client = openai.NewClient(os.Getenv("OPENAI_API_KEY"))
	err := c.ShouldBindJSON(&reqBody)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := client.CreateImage(context.Background(), openai.ImageRequest{
		Prompt: reqBody.Prompt,
		N:      1,
		Size:   openai.CreateImageSize512x512,
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
