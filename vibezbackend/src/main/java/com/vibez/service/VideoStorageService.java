package com.vibez.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.bramp.ffmpeg.FFmpeg;
import net.bramp.ffmpeg.FFmpegExecutor;
import net.bramp.ffmpeg.FFprobe;
import net.bramp.ffmpeg.builder.FFmpegBuilder;
import net.bramp.ffmpeg.probe.FFmpegProbeResult;
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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VideoStorageService {

    @Value("${r2.public.url}")
    private String r2publicurl;

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${ffmpeg.path:ffmpeg}")
    private String ffmpegPath;

    @Value("${ffprobe.path:ffprobe}")
    private String ffprobePath;

    public static class VideoUploadResult {
        public String videoFileName;
        public List<String> previewFrameUrls;

        public VideoUploadResult(String videoFileName, List<String> previewFrameUrls) {
            this.videoFileName = videoFileName;
            this.previewFrameUrls = previewFrameUrls;
        }
    }

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


    public VideoUploadResult uploadAndConvertVideo(MultipartFile file) throws IOException {
        log.info("Starting video upload and conversion for file: {}", file.getOriginalFilename());

        Path tempDir = Files.createTempDirectory("video-conversion-");
        String originalFileName = file.getOriginalFilename();
        String extension = getFileExtension(originalFileName);

        try {
            Path inputPath = tempDir.resolve("input" + extension);
            file.transferTo(inputPath.toFile());
            log.info("Saved input file to: {}", inputPath);

            Path outputPath = tempDir.resolve("output.mp4");

            if (!extension.equalsIgnoreCase(".mp4")) {
                log.info("Converting {} to MP4", extension);
                convertToMp4(inputPath.toFile(), outputPath.toFile());
            } else {
                log.info("File is already MP4, copying...");
                Files.copy(inputPath, outputPath);
            }

            String videoFileName = System.currentTimeMillis() + "_" +
                    originalFileName.replaceAll("\\.[^.]+$", ".mp4");

            log.info("Uploading video to S3/R2 as: {}", videoFileName);

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(videoFileName)
                    .contentType("video/mp4")
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromFile(outputPath));
            log.info("Video uploaded successfully: {}", videoFileName);

            log.info("Generating preview frames...");
            List<String> previewFrameUrls = generatePreviewFrames(
                    outputPath.toFile(),
                    tempDir,
                    videoFileName
            );

            return new VideoUploadResult(videoFileName, previewFrameUrls);

        } finally {
            cleanupTempDirectory(tempDir);
        }
    }


    private List<String> generatePreviewFrames(File videoFile, Path tempDir, String videoFileName) throws IOException {
        List<String> frameUrls = new ArrayList<>();

        try {
            FFmpeg ffmpeg = new FFmpeg(ffmpegPath);
            FFprobe ffprobe = new FFprobe(ffprobePath);

            FFmpegProbeResult probe = ffprobe.probe(videoFile.getAbsolutePath());
            double duration = probe.getFormat().duration;

            int frameCount = 6;
            double interval = duration / (frameCount + 1);

            for (int i = 1; i <= frameCount; i++) {
                double timestamp = interval * i;
                String frameFileName = videoFileName.replace(".mp4", "_frame_" + i + ".jpg");
                Path framePath = tempDir.resolve("frame_" + i + ".jpg");

                // Extract frame at specific timestamp
                FFmpegBuilder builder = new FFmpegBuilder()
                        .setInput(videoFile.getAbsolutePath())
                        .addOutput(framePath.toString())
                        .setFrames(1)
                        .setVideoFilter("select='eq(n\\," + (int)(timestamp * 30) + ")'")
                        .setStartOffset((long)(timestamp * 1000), java.util.concurrent.TimeUnit.MILLISECONDS)
                        .done();

                builder = new FFmpegBuilder()
                        .setInput(videoFile.getAbsolutePath())
                        .addExtraArgs("-ss", String.valueOf(timestamp))
                        .addOutput(framePath.toString())
                        .setFrames(1)
                        .setVideoQuality(2)
                        .done();

                FFmpegExecutor executor = new FFmpegExecutor(ffmpeg, ffprobe);
                executor.createJob(builder).run();

                if (Files.exists(framePath)) {
                    PutObjectRequest putRequest = PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(frameFileName)
                            .contentType("image/jpeg")
                            .build();

                    s3Client.putObject(putRequest, RequestBody.fromFile(framePath));
                    frameUrls.add(buildPublicUrl(frameFileName));
                    log.info("Uploaded preview frame: {}", frameFileName);
                }
            }

        } catch (IOException e) {
            log.error("Failed to generate preview frames", e);
        }

        return frameUrls;
    }

    private void convertToMp4(File input, File output) throws IOException {
        try {
            log.info("Initializing FFmpeg with path: {}", ffmpegPath);
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
            log.info("Starting FFmpeg conversion...");
            executor.createJob(builder).run();
            log.info("FFmpeg conversion completed successfully");

        } catch (IOException e) {
            log.error("Video conversion failed", e);
            throw new IOException("Video conversion failed: " + e.getMessage(), e);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private void cleanupTempDirectory(Path tempDir) {
        try {
            Files.walk(tempDir)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
            log.info("Cleaned up temp directory: {}", tempDir);
        } catch (IOException e) {
            log.error("Failed to cleanup temp directory: {}", tempDir, e);
        }
    }

    public String buildPublicUrl(String fileName) {
        return r2publicurl + "/" + fileName;
    }
}