package com.himanshu.ecommerce.repository;

import com.himanshu.ecommerce.entities.Cart;
import com.himanshu.ecommerce.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart,Long> {

    Optional<Cart> findByUser(User user);
}
