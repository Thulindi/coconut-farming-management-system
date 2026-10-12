package com.coconutfarming.inventory.repository;

import com.coconutfarming.inventory.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {

    List<Supplier> findByUserIdAndIsActiveTrue(Long userId);

    List<Supplier> findByUserIdAndSupplierNameContainingIgnoreCase(Long userId, String name);
}
