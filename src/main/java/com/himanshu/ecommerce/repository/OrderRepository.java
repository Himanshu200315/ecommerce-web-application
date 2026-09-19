package com.himanshu.ecommerce.repository;

import com.himanshu.ecommerce.entities.Order;
import com.himanshu.ecommerce.entities.OrderStatus;
import com.himanshu.ecommerce.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser(User user);
    Optional<Order> findByIdAndUser(Long orderId, User user);
    long countByStatus(OrderStatus status);

}
