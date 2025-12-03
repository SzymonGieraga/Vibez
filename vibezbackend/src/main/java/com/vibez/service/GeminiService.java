package com.vibez.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.vibez.dto.AiMetadataResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper;

    public GeminiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public AiMetadataResponse generateMetadata(String songTitle, String author, String genre, String language) {
        try {
            Client client = Client.builder()
                    .apiKey(apiKey)
                    .build();

            String prompt;
            String targetLang = (language != null && !language.isEmpty()) ? language.toLowerCase() : "en";

            if ("pl".equals(targetLang)) {
                prompt = String.format(
                        """
                        Kontekst: Rolka wideo (Reel) w mediach społecznościowych z utworem '%s' wykonawcy '%s' (Gatunek: %s).
                        
                        Zadanie: Wygeneruj surowy obiekt JSON (bez Markdown) z dwoma kluczami: 'description' oraz 'tags'.
                        
                        Zasady dla 'description':
                        - Napisz krótki, angażujący opis (maksymalnie 4 zdania).
                        - Opis musi być napisany w 100%% PO POLSKU. Używaj młodzieżowego, luźnego stylu (slang dozwolony, ale z umiarem).
                        - Możesz używać emoji.
                        
                        Zasady dla 'tags':
                        - Wygeneruj jeden ciąg znaków z tagami oddzielonymi przecinkami (bez znaków #).
                        - Pierwsze tagi muszą odnosić się bezpośrednio do tytułu utworu, wykonawcy i gatunku (zachowaj ich oryginalną pisownię).
                        - OSTATNI tag musi być słowem 'Muzyka' lub 'Viral'.
                        
                        Format wyjściowy (tylko czysty JSON):
                        {
                            "description": "...",
                            "tags": "..."
                        }
                        Nie dodawaj bloków kodu ```json.
                        """,
                        songTitle, author, genre
                );
            } else {
                prompt = String.format(
                        """
                        Context: A social media video reel featuring the song '%s' by '%s' (Genre: %s).
                        
                        Task: Generate a raw JSON response with exactly two keys: 'description' and 'tags'.
                        
                        Rules for 'description':
                        - Write a short, engaging caption (max 4 sentences).
                        - STRICTLY write in ENGLISH. Use a casual, social-media friendly tone.
                        - You can use emojis.
                        
                        Rules for 'tags':
                        - Generate a single string of comma-separated tags (no # symbols).
                        - The first few tags MUST be derived directly from the Song Title, Artist Name, and Genre.
                        - The VERY LAST tag MUST be the word 'Music' or 'Viral'.
                        
                        Output format (Raw JSON only):
                        {
                            "description": "...",
                            "tags": "..."
                        }
                        Do not include markdown formatting like ```json.
                        """,
                        songTitle, author, genre
                );
            }

            GenerateContentResponse response = client.models.generateContent(
                    "gemini-2.5-pro",
                    prompt,
                    null
            );

            String responseText = response.text();

            String cleanJson = responseText.replace("```json", "").replace("```", "").trim();
            JsonNode jsonResponse = objectMapper.readTree(cleanJson);

            return new AiMetadataResponse(
                    jsonResponse.get("description").asText(),
                    jsonResponse.get("tags").asText()
            );

        } catch (Exception e) {
            throw new RuntimeException("AI generation failed: " + e.getMessage(), e);
        }
    }
}