package com.vibez.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.URL;
import java.util.concurrent.TimeUnit;

@Service
public class ImageStorageService {

    private final Storage storage;

    @Value("${gcp.storage.bucket-name}")
    private String bucketName;

    @Value("${gcp.credentials.file-path:}")
    private String credentialsFilePath;

    public ImageStorageService() throws IOException {
        GoogleCredentials credentials;

        if (credentialsFilePath != null && !credentialsFilePath.trim().isEmpty()) {
            if (credentialsFilePath.startsWith("classpath:")) {
                String resourcePath = credentialsFilePath.substring("classpath:".length());
                ClassPathResource resource = new ClassPathResource(resourcePath);
                try (InputStream inputStream = resource.getInputStream()) {
                    credentials = GoogleCredentials.fromStream(inputStream);
                }
            } else {
                try (FileInputStream serviceAccountStream = new FileInputStream(credentialsFilePath)) {
                    credentials = GoogleCredentials.fromStream(serviceAccountStream);
                }
            }
        } else {
            try {
                ClassPathResource resource = new ClassPathResource("gcp-key.json");
                try (InputStream inputStream = resource.getInputStream()) {
                    credentials = GoogleCredentials.fromStream(inputStream);
                }
            } catch (Exception e) {
                credentials = GoogleCredentials.getApplicationDefault();
            }
        }

        this.storage = StorageOptions.newBuilder()
                .setCredentials(credentials)
                .build()
                .getService();
    }

    public String generatePresignedUrl(String fileName, String contentType) {
        BlobInfo blobInfo = BlobInfo.newBuilder(BlobId.of(bucketName, fileName))
                .setContentType(contentType)
                .build();
        URL url = storage.signUrl(
                blobInfo,
                15,
                TimeUnit.MINUTES,
                Storage.SignUrlOption.httpMethod(HttpMethod.PUT),
                Storage.SignUrlOption.withV4Signature()
        );
        return url.toString();
    }

    public String uploadFile(MultipartFile file) throws IOException {
        byte[] imageBytes = convertToJpg(file);
        String originalFileName = file.getOriginalFilename();
        String baseFileName = originalFileName != null ?
                originalFileName.substring(0, originalFileName.lastIndexOf('.')) :
                "image";
        String fileName = System.currentTimeMillis() + "_" + baseFileName + ".jpg";

        BlobId blobId = BlobId.of(bucketName, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType("image/jpeg")
                .build();

        storage.create(blobInfo, imageBytes);

        return buildPublicUrl(fileName);
    }

    private byte[] convertToJpg(MultipartFile file) throws IOException {
        BufferedImage image = ImageIO.read(file.getInputStream());

        if (image == null) {
            throw new IOException("Nie można odczytać pliku obrazu");
        }

        BufferedImage rgbImage = new BufferedImage(
                image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_RGB);
        rgbImage.createGraphics().drawImage(image, 0, 0,
                java.awt.Color.WHITE, null);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(rgbImage, "jpg", outputStream);

        return outputStream.toByteArray();
    }

    public String buildPublicUrl(String fileName) {
        return "https://storage.googleapis.com/" + bucketName + "/" + fileName;
    }
}