package com.vibez.controller;

import com.vibez.dto.AiMetadataRequest;
import com.vibez.dto.AiMetadataResponse;
import com.vibez.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/generate-metadata")
    public ResponseEntity<AiMetadataResponse> generateMetadata(@RequestBody AiMetadataRequest request) {
        return ResponseEntity.ok(geminiService.generateMetadata(
                request.songTitle(),
                request.author(),
                request.genre(),
                request.language()
        ));
    }
}