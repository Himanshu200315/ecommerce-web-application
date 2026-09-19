package com.himanshu.ecommerce.repository;

import com.himanshu.ecommerce.entities.Cart;
import com.himanshu.ecommerce.entities.CartItem;
import com.himanshu.ecommerce.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    List<CartItem> findByCart(Cart cart);
    Optional<CartItem>findByIdAndCart(Long id, Cart cart);
}
