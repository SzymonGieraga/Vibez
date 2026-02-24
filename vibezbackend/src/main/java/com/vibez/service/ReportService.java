package com.vibez.service;

import com.vibez.model.Report;
import com.vibez.model.User;
import com.vibez.model.types.ReportStatus;
import com.vibez.model.types.ReportType;
import com.vibez.repository.CommentRepository;
import com.vibez.repository.ReelRepository;
import com.vibez.repository.ReportRepository;
import com.vibez.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final ReelRepository reelRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final VideoStorageService videoStorageService;
    private final ImageStorageService imageStorageService;

    public ReportService(ReportRepository reportRepository, ReelRepository reelRepository,
                         CommentRepository commentRepository, UserRepository userRepository,
                         VideoStorageService videoStorageService, ImageStorageService imageStorageService) {
        this.reportRepository = reportRepository;
        this.reelRepository = reelRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.videoStorageService = videoStorageService;
        this.imageStorageService = imageStorageService;
    }

    public void createReport(User reporter, ReportType type, Long contentId, String reason) {
        Report report = new Report();
        report.setReporter(reporter);
        report.setType(type);
        report.setContent_id(contentId);
        report.setReason(reason);
        reportRepository.save(report);
    }

    public Page<Map<String, Object>> getReports(Pageable pageable) {
        return reportRepository.findAllByOrderByCreatedAtDesc(pageable).map(report -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", report.getId());
            dto.put("reporterUsername", report.getReporter().getUsername());
            dto.put("type", report.getType().name());
            dto.put("contentId", report.getContent_id());
            dto.put("reason", report.getReason());
            dto.put("status", report.getStatus().name());
            dto.put("createdAt", report.getCreatedAt());

            if (report.getType() == ReportType.REEL) {
                reelRepository.findById(report.getContent_id()).ifPresent(reel -> dto.put("reel", reel));
            } else if (report.getType() == ReportType.COMMENT) {
                commentRepository.findById(report.getContent_id()).ifPresent(comment -> {
                    dto.put("commentText", comment.getText());
                    dto.put("commentAuthor", comment.getUser().getUsername());
                });
            } else if (report.getType() == ReportType.USER) {
                userRepository.findById(report.getContent_id()).ifPresent(user -> {
                    Map<String, Object> userDto = new HashMap<>();
                    userDto.put("username", user.getUsername());
                    userDto.put("profilePictureUrl", user.getProfilePictureUrl());
                    userDto.put("bio", user.getBio());
                    dto.put("reportedUser", userDto);
                });
            }
            return dto;
        });
    }

    @Transactional
    public void acceptReport(Long reportId) {
        Report report = reportRepository.findById(reportId).orElseThrow();

        if (report.getStatus() != ReportStatus.PENDING) {
            return;
        }

        if (report.getType() == ReportType.REEL) {
            reelRepository.findById(report.getContent_id()).ifPresent(reel -> {
                if (reel.getVideoUrl() != null) videoStorageService.deleteFileFromUrl(reel.getVideoUrl());
                if (reel.getThumbnailUrl() != null) imageStorageService.deleteFileFromUrl(reel.getThumbnailUrl());
                if (reel.getPreview() != null && reel.getPreview().getFrameUrls() != null) {
                    reel.getPreview().getFrameUrls().forEach(imageStorageService::deleteFileFromUrl);
                }
                reelRepository.delete(reel);
            });
        } else if (report.getType() == ReportType.COMMENT) {
            commentRepository.deleteById(report.getContent_id());
        } else if (report.getType() == ReportType.USER) {
            userRepository.findById(report.getContent_id()).ifPresent(user -> {
                user.setRole("ROLE_BANNED");
                userRepository.save(user);
            });
        }

        report.setStatus(ReportStatus.RESOLVED);
        reportRepository.save(report);
    }

    @Transactional
    public void rejectReport(Long reportId) {
        Report report = reportRepository.findById(reportId).orElseThrow();
        if (report.getStatus() == ReportStatus.PENDING) {
            report.setStatus(ReportStatus.REJECTED);
            reportRepository.save(report);
        }
    }
}