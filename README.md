# ChatGPT clone with DALL.E image generation model

## install

### client
```bash
cd client && npm i
```
### server
```bash
# ASAP
```

## Configuration
### Server
1. obtain your openai api key from [here](https://openai.com)
2. `cd goserver`
3. copy `.env.example` to `.env`
4. add your openai api key inside `.env`
5. make sure you have added `.env` to your `.gitignore` file

### Client
1. `cd client`
2. copy `.env.example` to `.env`
3. add your fiirebase config and server url
4. make sure you have added `.env` to your `.gitignore` file

## run
### to run client
```bash
cd client
npm start
```
### to run server
```bash
cd goserver
go run main.go
```

***Tech used***
  - openai API
  - react
  - tailwindcss
  - react-icons
  - react-markdown
  - GOLand


## credits
- [OpenAI](https://openai.com) for creating [ChatGPT](https://chat.openai.com/chat)

## 📝 License © [Eyuel](https://linkedin.com/in/eyuel-daniel)
## 📝 License © [Alorse](https://www.linkedin.com/in/alorse/) (Go Version)

>This project is released under the Apache License 2.0 license.
See [LICENSE](./LICENSE) for details.
