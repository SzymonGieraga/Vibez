package com.vibez.service;

import com.vibez.model.Reel;
import com.vibez.model.ReelPreview;
import com.vibez.repository.ReelPreviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReelPreviewService {

    private final ReelPreviewRepository previewRepository;

    @Transactional
    public ReelPreview createPreview(Reel reel, List<String> frameUrls) {
        ReelPreview preview = new ReelPreview(reel);
        preview.setFrameUrls(frameUrls);

        ReelPreview saved = previewRepository.save(preview);
        log.info("Created preview for reel {}, with {} frames", reel.getId(), frameUrls.size());

        return saved;
    }

    public Optional<ReelPreview> getPreviewByReelId(Long reelId) {
        return previewRepository.findByReelId(reelId);
    }

    @Transactional
    public void updatePreview(Long reelId, List<String> newFrameUrls) {
        Optional<ReelPreview> existing = previewRepository.findByReelId(reelId);

        if (existing.isPresent()) {
            ReelPreview preview = existing.get();
            preview.setFrameUrls(newFrameUrls);
            previewRepository.save(preview);
            log.info("Updated preview for reel {}", reelId);
        }
    }

    @Transactional
    public void deletePreview(Long reelId) {
        previewRepository.findByReelId(reelId)
                .ifPresent(preview -> {
                    previewRepository.delete(preview);
                    log.info("Deleted preview for reel {}", reelId);
                });
    }
}