package com.coconutfarming.disease.service;

import com.coconutfarming.disease.dto.PredictionResult;
import com.coconutfarming.disease.model.DiseaseDetectionHistory;
import com.coconutfarming.disease.repository.DiseaseDetectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class DiseaseDetectionService {

    @Autowired
    private DiseaseDetectionRepository repository;

    private final String UPLOAD_DIR = "uploads/";
    private final String PYTHON_API_URL = "http://localhost:8001/predict";

    public DiseaseDetectionHistory detectAndSave(Long userId, MultipartFile file) throws IOException {
        // 1. Save file locally
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        String imageUrl = "/public/photos/" + fileName;

        // 2. Call Python API
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<PredictionResult> response = restTemplate.postForEntity(PYTHON_API_URL, requestEntity, PredictionResult.class);
        
        PredictionResult prediction = response.getBody();

        if (prediction == null || "Error".equals(prediction.getDisease())) {
            throw new RuntimeException("Error from AI Model: " + (prediction != null ? prediction.getError() : "Unknown error"));
        }

        // 3. Rule-based Treatments
        String treatment = getTreatmentForDisease(prediction.getDisease());

        // 4. Save History
        DiseaseDetectionHistory history = new DiseaseDetectionHistory();
        history.setUserId(userId);
        history.setImageUrl(imageUrl);
        history.setDiseaseName(prediction.getDisease());
        history.setConfidence(prediction.getConfidence());
        history.setTreatmentRecommendation(treatment);

        return repository.save(history);
    }

    public List<DiseaseDetectionHistory> getUserHistory(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void deleteHistory(Long id, Long userId) {
        DiseaseDetectionHistory history = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("History not found"));
        
        if (!history.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this record");
        }
        
        repository.delete(history);
    }

    private String getTreatmentForDisease(String diseaseName) {
        if (diseaseName == null) return "Consult an agricultural expert.\n\nකෘෂිකර්ම උපදේශකයෙකු හමුවන්න.";
        
        return switch (diseaseName) {
            case "Caterpillars (CCI)" -> "Apply Neem oil extract or Monocrotophos to the affected areas. Remove severely affected leaves manually and burn them.\n\nබලපෑමට ලක්වූ ප්‍රදේශවලට කොහොඹ තෙල් සාරය හෝ කෘමිනාශක යොදන්න. දැඩි ලෙස හානි වූ කොළ කපා ඉවත් කර පුළුස්සා දමන්න.";
            case "Leaflets (CCI)" -> "Ensure proper spacing and ventilation. Apply a mild copper-based fungicide if fungal infection is suspected along with pest damage.\n\nගස් අතර නිසි පරතරයක් සහ වාතාශ්‍රයක් පවත්වා ගන්න. කෘමි හානි සමඟ දිලීර ආසාදනයක් ඇති බවට සැක කරන්නේ නම් තඹ අඩංගු දිලීර නාශකයක් (Copper-based fungicide) යොදන්න.";
            case "Healthy" -> "Your coconut plant looks healthy! Maintain regular watering and standard fertilizer schedules.\n\nඔබගේ පොල් ශාකය ඉතා නිරෝගී බව පෙනේ! නිතිපතා ජලය යෙදීම සහ සම්මත පොහොර යෙදීම් කාලසටහන් ඒ විදිහටම පවත්වාගෙන යන්න.";
            case "Drying of Leaflets (WCLWD)" -> "Improve soil moisture by mulching. Check for root wilt disease. Apply recommended doses of Muriate of Potash (MoP) and organic manure.\n\nපොල් ලෙලි හෝ කොළ යොදා වසුන් යෙදීමෙන් පසෙහි තෙතමනය ආරක්ෂා කරන්න. මුල් කුණුවීමේ රෝගය ඇත්දැයි පරීක්ෂා කරන්න. නිර්දේශිත මියුරියට් ඔෆ් පොටෑෂ් (MoP) සහ කාබනික පොහොර යොදන්න.";
            case "Flaccidity (WCLWD)" -> "Flaccidity is an early symptom of root wilt. Provide balanced NPK fertilizers with Magnesium sulphate. Ensure proper drainage in the field.\n\nකොළ කඩාහැලීම යනු මුල් කුණුවීමේ (වැලිගම පොල් කොළ මැලවීමේ) මුල් රෝග ලක්ෂණයකි. මැග්නීසියම් සල්ෆේට් සමඟ සමබර NPK පොහොර යොදන්න. පොල් ඉඩමේ නිසි ලෙස ජලය බැසයාමට කානු සකස් කරන්න.";
            case "Yellowing (WCLWD)" -> "Yellowing indicates nutrient deficiency or root wilt. Apply balanced fertilizers, specifically focusing on Magnesium and Nitrogen. Test soil pH.\n\nකොළ කහ වීම මගින් පෝෂණ ඌනතාවයක් හෝ මුල් කුණුවීමක් පෙන්නුම් කරයි. විශේෂයෙන් මැග්නීසියම් සහ නයිට්‍රජන් අඩංගු සමබර පොහොර යොදන්න. පසේ pH අගය (ආම්ලිකතාවය) පරීක්ෂා කරන්න.";
            default -> "Consult an agricultural expert for precise treatment.\n\nනිවැරදි ප්‍රතිකාර සඳහා කෘෂිකර්ම උපදේශකවරයෙකු හමුවන්න.";
        };
    }
}
