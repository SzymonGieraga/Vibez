package com.vibez.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.vibez.model.types.ReportStatus;
import com.vibez.model.types.ReportType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User reporter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportType type;

    @Column(nullable = false)
    private Long content_id;

    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;

    @Column(nullable = false, updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    public void setId(Long id) {this.id = id;}
    public void getId(Long id) { this.id = id;}
    public User getReporter() {return this.reporter;}
    public void setReporter(User reporter) {this.reporter = reporter;}
    public ReportType getType() {return this.type;}
    public void setType(ReportType type) {this.type = type;}
    public Long getContent_id() {return this.content_id;}
    public void setContent_id(Long content_id) {this.content_id = content_id;}
    public String getReason() {return this.reason;}
    public void setReason(String reason) {this.reason = reason;}
    public ReportStatus getStatus() {return this.status;}
    public void setStatus(ReportStatus status) {this.status = status;}
    public LocalDateTime getCreatedAt() {return this.createdAt;}
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}
}
