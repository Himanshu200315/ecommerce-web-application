package com.himanshu.ecommerce.service;

import com.himanshu.ecommerce.dto.ProductRequestDto;
import com.himanshu.ecommerce.entities.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;


public interface ProductService {

    Product createProduct(ProductRequestDto product);

    Page<Product> getAllProducts(Pageable pageable);

    Product getProductById(Long id);

    Product updateProduct(Long id, Product product);


    void deleteProduct(Long id);
    Page<Product> searchProducts(
            String name,
            Pageable pageable
    );

    void uploadProductImage(Long productId, MultipartFile image);


}
