**Source files:** Download and extract [the project archive](coconut-farming-management-system.zip). The component paths below refer to the extracted archive.

# Coconut Farming Management System

Team project combining a Spring Boot farm management backend, React frontend, coconut leaf disease detection service, and a chatbot service.

## Components

- `Coconut-Farming-System/Backend`: Java Spring Boot API and MySQL data store.
- `Coconut-Farming-System/Frontend/frontend`: React and Vite web app.
- `Coconut_Disease_Detection`: FastAPI service and trained Keras model for leaf disease detection.
- `CoconutChatbot`: FastAPI chatbot with document retrieval and voice features.

## Local setup

1. Install Java, Maven, Node.js, Python, and MySQL.
2. Create a local MySQL database called `coconut_db`. Set `DB_USERNAME` and `DB_PASSWORD` in your environment. The backend reads these through `application.properties`.
3. Set optional service variables as needed: `WEATHER_API_KEY`, `NEWS_API_KEY`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `GOOGLE_CLIENT_ID`, and `GROQ_API_KEY`.
4. Install frontend packages in `Coconut-Farming-System/Frontend/frontend` with `npm install`, then run `npm run dev`.
5. Run the backend from `Coconut-Farming-System/Backend` with the Maven wrapper and `spring-boot:run`.
6. Install each Python service's `requirements.txt`, then run `uvicorn main:app --port 8001` from `Coconut_Disease_Detection` and `uvicorn app:app --port 8000` from `CoconutChatbot`.

The chatbot's reference PDFs and generated vector database are not in this public repository. Add authorized documents to `CoconutChatbot/data` and rebuild the local retrieval index before using document-based answers.

Local credentials, uploaded user files, logs, dependencies, and generated indexes are excluded from version control.
