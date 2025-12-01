package com.vibez.service;

import com.vibez.model.Tag;
import com.vibez.repository.TagRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public Set<Tag> findOrCreateTags(String tagsString) {
        if (tagsString == null || tagsString.trim().isEmpty()) {
            return new HashSet<>();
        }

        return Arrays.stream(tagsString.split(","))
                .map(String::trim)
                .filter(tagName -> !tagName.isEmpty())
                .map(tagName -> {
                    String cleanTagName = tagName.startsWith("#") ? tagName.substring(1) : tagName;
                    return tagRepository.findByName(cleanTagName)
                            .orElseGet(() -> tagRepository.save(new Tag(cleanTagName)));
                })
                .collect(Collectors.toSet());
    }
}

