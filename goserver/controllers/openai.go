package controllers

import (
	"context"
	"fmt"
	"log"
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
	if cleanedPrompt == "" {
		c.JSON(http.StatusBadRequest, gin.H{"statusText": "Missing required field \"prompt\" in request body"})
		return
	}

	messages := getOldMessages(reqBody, []openai.ChatCompletionMessage{
		{
			Role:    openai.ChatMessageRoleSystem,
			Content: "You're an a AI assistant that replies to all my questions in markdown format.",
		},
		{
			Role:    openai.ChatMessageRoleUser,
			Content: cleanedPrompt,
		},
	})

	CreateNewMessage(models.ReqBody{
		Prompt: cleanedPrompt,
		User:   reqBody.User,
		Room:   &roomID,
	})

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model:    openai.GPT3Dot5Turbo,
			Messages: messages,
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
			go createRoomTitle(resp.Choices[0].Message.Content, roomID)
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

func createRoomTitle(text string, roomID string) {
	resp, _ := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser,
					Content: "What title of less than 4 words would you give to the text in the language of the text? " + text,
				},
			},
		},
	)
	UpdateRoom(roomID, resp.Choices[0].Message.Content)
}

func getOldMessages(reqBody models.ReqBody, messages []openai.ChatCompletionMessage) []openai.ChatCompletionMessage {
	if reqBody.Room != nil {
		var oldMessages []models.Message
		var completeMessages []openai.ChatCompletionMessage
		oldMessages, err := GetMessagesByRoom(*reqBody.Room, 6, `DESC`)
		if err != nil {
			log.Fatal(err)
		}

		completeMessages = append(completeMessages, messages[0])
		// Recorrer oldMessages en orden inverso y agregar los mensajes a completeMessages
		for i := len(oldMessages) - 1; i >= 0; i-- {
			role := openai.ChatMessageRoleAssistant
			if oldMessages[i].UserID == "0" {
				role = openai.ChatMessageRoleUser
			}
			message := openai.ChatCompletionMessage{
				Role:    role,
				Content: oldMessages[i].MessageText,
			}
			completeMessages = append(completeMessages, message)
		}
		completeMessages = append(completeMessages, messages[1])

		return completeMessages
	} else {
		return messages
	}
}
