package com.vibez.service;

import lombok.RequiredArgsConstructor;
import net.bramp.ffmpeg.FFmpeg;
import net.bramp.ffmpeg.FFmpegExecutor;
import net.bramp.ffmpeg.FFprobe;
import net.bramp.ffmpeg.builder.FFmpegBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VideoStorageService {

    @Value("${r2.public.url}")
    private String r2publicurl;

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${ffmpeg.path:/usr/bin/ffmpeg}")
    private String ffmpegPath;

    @Value("${ffprobe.path:/usr/bin/ffprobe}")
    private String ffprobePath;

    public String generatePresignedUrl(String fileName, String contentType) {
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        return presignedRequest.url().toString();
    }

    public String uploadAndConvertVideo(MultipartFile file) throws IOException {
        Path tempDir = Files.createTempDirectory("video-conversion");
        String originalFileName = file.getOriginalFilename();
        String extension = originalFileName.substring(originalFileName.lastIndexOf("."));

        try {
            // Save uploaded file
            Path inputPath = tempDir.resolve("input" + extension);
            file.transferTo(inputPath.toFile());

            // Convert to MP4 if needed
            Path outputPath = tempDir.resolve("output.mp4");

            if (!extension.equalsIgnoreCase(".mp4")) {
                convertToMp4(inputPath.toFile(), outputPath.toFile());
            } else {
                Files.copy(inputPath, outputPath);
            }

            // Upload to R2/S3
            String fileName = System.currentTimeMillis() + "_" +
                    originalFileName.replaceAll("\\.[^.]+$", ".mp4");

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType("video/mp4")
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromFile(outputPath));

            return fileName;
        } finally {
            // Cleanup temp files
            Files.walk(tempDir)
                    .map(Path::toFile)
                    .forEach(File::delete);
            Files.delete(tempDir);
        }
    }

    private void convertToMp4(File input, File output) throws IOException {
        try {
            FFmpeg ffmpeg = new FFmpeg(ffmpegPath);
            FFprobe ffprobe = new FFprobe(ffprobePath);

            FFmpegBuilder builder = new FFmpegBuilder()
                    .setInput(input.getAbsolutePath())
                    .overrideOutputFiles(true)
                    .addOutput(output.getAbsolutePath())
                    .setFormat("mp4")
                    .setVideoCodec("libx264")
                    .setVideoPixelFormat("yuv420p")
                    .setPreset("medium")
                    .setConstantRateFactor(23)
                    .setAudioCodec("aac")
                    .setAudioBitRate(128_000)
                    .addExtraArgs("-movflags", "+faststart")
                    .done();

            FFmpegExecutor executor = new FFmpegExecutor(ffmpeg, ffprobe);
            executor.createJob(builder).run();
        } catch (IOException e) {
            throw new IOException("Video conversion failed: " + e.getMessage(), e);
        }
    }

    public String buildPublicUrl(String fileName) {
        return r2publicurl + "/" + fileName;
    }
}