package com.vibez.controller;

import com.vibez.model.User;
import com.vibez.model.types.ReportType;
import com.vibez.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<?> submitReport(@AuthenticationPrincipal User user, @RequestBody Map<String, Object> payload) {
        ReportType type = ReportType.valueOf((String) payload.get("type"));
        Long contentId = Long.valueOf(payload.get("contentId").toString());
        String reason = (String) payload.get("reason");

        reportService.createReport(user, type, contentId, reason);
        return ResponseEntity.ok().build();
    }
}