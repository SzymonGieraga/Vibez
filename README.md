# Vibez

Vibez is a social media platform designed to promote musical creativity through short video content. It allows users to record, upload, and share short musical clips (reels), interact with other creators, and discover new trends.

## Architecture Overview

The application follows a classic Client-Server architecture with a decoupled frontend and backend.

* **Frontend**: A Single Page Application (SPA) built with **React** and **Vite**. It handles the user interface, media playback, and client-side logic.
* **Backend**: A RESTful API built with **Spring Boot**. It manages business logic, data persistence, video processing, and real-time communication.
* **Database**: **PostgreSQL** is used as the primary relational database for storing user data, metadata, comments, and interactions.
* **Storage**: **Cloudflare R2** (S3-compatible) is used for storing large binary files like video reels. **Google Cloud Storage** is integrated to store smaller, easier to access files like images.
* **Real-time**: **WebSockets** (STOMP protocol) are utilized for instant messaging (chat) and real-time notifications.
* **Authentication**: **Firebase** is used for identity management and authentication.

## Tech Stack

### Backend
* **Language**: Java 17
* **Framework**: Spring Boot 3.5.6
    * Spring Web (REST API)
    * Spring Data JPA (Hibernate)
    * Spring Security
    * Spring WebSocket
* **Database**: PostgreSQL 17.6
* **Media Processing**: FFmpeg (via `net.bramp.ffmpeg`)
* **Cloud Services**:
    * AWS SDK (for Cloudflare R2 integration)
    * Google Cloud Storage
    * Firebase Admin SDK
* **Utilities**: Lombok, Jackson

### Frontend
* **Library**: React 19
* **Build Tool**: Vite
* **Styling**: Tailwind CSS 4
* **Communication**:
    * Axios (HTTP)
    * SockJS & StompJS (WebSockets)
* **Internationalization**: i18next
* **Routing**: React Router DOM

## Prerequisites

* Java Development Kit (JDK) 17
* Node.js (v18 or higher)
* PostgreSQL Database
* FFmpeg installed on the host machine

## Configuration

### Backend Configuration
The backend requires the following environment variables or properties configured in `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://<HOST>:<PORT>/<DB_NAME>
spring.datasource.username=<DB_USER>
spring.datasource.password=<DB_PASSWORD>

# Server
server.port=8080

# File Upload Limits
spring.servlet.multipart.max-file-size=250MB
spring.servlet.multipart.max-request-size=250MB

# S3 / Cloudflare R2 Configuration
aws.s3.endpoint=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
aws.s3.access-key-id=<ACCESS_KEY>
aws.s3.secret-access-key=<SECRET_KEY>
aws.s3.bucket-name=<BUCKET_NAME>
r2.public.url=<PUBLIC_ACCESS_URL>

# FFmpeg Paths
ffmpeg.path=/path/to/ffmpeg
ffprobe.path=/path/to/ffprobe

//Configure Firebase and API endpoints in your environment files or configuration objects within src/firebaseConfig.js and src/api/apiClient.js.
```
## Installation & Running
### Backend
Navigate to the backend directory:
```cd vibezbackend```  

Build the project:
```./mvnw clean install```  

Run the application:
```./mvnw spring-boot:run```  
### Frontend
Navigate to the frontend directory:
```cd vibezfrontend```  

Install dependencies:
```npm install```  

Run the development server:
```npm run dev```  

### Key Features
Reel Upload & Playback: Users can upload short videos which are processed and optimized by the backend.

Interactive Feed: Infinite scroll feed for discovering content.

Social Interactions: Like, comment, and share functionality.

Playlists: Users can create and manage playlists of their favorite reels.

Real-time Chat: Instant messaging system between users.

Profile Management: extensive user profiles with follow/unfollow mechanisms.

Language: Interface available in English and Polish.
