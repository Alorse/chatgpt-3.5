package controllers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"servergpt/models"

	"github.com/gin-gonic/gin"
	openai "github.com/sashabaranov/go-openai"
)

type Response struct {
	Bot  string `json:"bot"`
	Room string `json:"room"`
}

var reqBody models.ReqBody
var client *openai.Client

func CreateChatCompletion(c *gin.Context) {
	client = openai.NewClient(os.Getenv("OPENAI_API_KEY"))
	err := c.ShouldBindJSON(&reqBody)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	roomID, errCNR := CreateNewRoom(reqBody)
	cleanedPrompt := reqBody.Prompt
	CreateNewMessage(models.ReqBody{
		Prompt: cleanedPrompt,
		User:   reqBody.User,
		Room:   &roomID,
	})

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
					Content: "You're an a AI assistant that replies to all my questions in markdown format.",
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
	_, errCNM := CreateNewMessage(models.ReqBody{
		Prompt: resp.Choices[0].Message.Content,
		User:   "0",
		Room:   &roomID,
	})
	if errCNM != nil {
		fmt.Println(errCNM)
		c.JSON(http.StatusBadRequest, gin.H{"statusText": "There was a problem creating the Message"})
		return
	}
	c.JSON(http.StatusOK, Response{
		Bot:  resp.Choices[0].Message.Content,
		Room: roomID,
	})

	if reqBody.Room == nil {
		if errCNR != nil {
			c.JSON(http.StatusBadRequest, gin.H{"statusText": "There was a problem creating the Room"})
			return
		} else {
			go func(text string) {
				resp, _ := client.CreateChatCompletion(
					context.Background(),
					openai.ChatCompletionRequest{
						Model: openai.GPT3Dot5Turbo,
						Messages: []openai.ChatCompletionMessage{
							{
								Role:    openai.ChatMessageRoleUser,
								Content: "What title of less than 6 words would you give to the text in the language of the text? " + text,
							},
						},
					},
				)
				UpdateRoom(roomID, resp.Choices[0].Message.Content)
			}(resp.Choices[0].Message.Content)
		}
	}
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
		Bot: url,
	})
}
