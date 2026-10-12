package com.coconutfarming.plantation.controller;

import com.coconutfarming.plantation.dto.LandRequest;
import com.coconutfarming.plantation.dto.LandResponse;
import com.coconutfarming.plantation.model.LandStatus;
import com.coconutfarming.plantation.service.LandService;
import com.coconutfarming.plantation.util.MapperUtil;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lands")
public class LandController {
    private final LandService landService;

    public LandController(LandService landService) {
        this.landService = landService;
    }

    @GetMapping
    public Page<LandResponse> list(@RequestParam Long farmerId,
                                  @RequestParam(required = false) LandStatus status,
                                  @RequestParam(required = false) String search,
                                  @PageableDefault(size = 20) Pageable pageable) {
        return landService.search(farmerId, status, search, pageable)
            .map(MapperUtil::toLandResponse);
    }

    @GetMapping("/admin")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ADMIN')")
    public Page<LandResponse> listAdmin(@RequestParam(required = false) String district,
                                       @PageableDefault(size = 100) Pageable pageable) {
        return landService.getAllAdmin(district, pageable)
            .map(MapperUtil::toLandResponse);
    }

    @GetMapping("/officer")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('OFFICER')")
    public Page<LandResponse> listOfficer(@RequestParam Long officerId,
                                         @PageableDefault(size = 50) Pageable pageable) {
        return landService.getAllOfficer(officerId, pageable)
            .map(MapperUtil::toLandResponse);
    }

    @PostMapping
    public ResponseEntity<LandResponse> create(@RequestParam Long farmerId, @Valid @RequestBody LandRequest request) {
        return new ResponseEntity<>(MapperUtil.toLandResponse(landService.create(farmerId, request)), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public LandResponse get(@RequestParam Long farmerId, @PathVariable Long id) {
        return MapperUtil.toLandResponse(landService.getById(id, farmerId));
    }

    @PutMapping("/{id}")
    public LandResponse update(@RequestParam Long farmerId, @PathVariable Long id, @Valid @RequestBody LandRequest request) {
        return MapperUtil.toLandResponse(landService.update(farmerId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@RequestParam Long farmerId, @PathVariable Long id) {
        landService.deleteLand(farmerId, id);
        return ResponseEntity.noContent().build();
    }
}
