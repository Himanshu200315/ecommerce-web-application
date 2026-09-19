package com.himanshu.ecommerce.repository;

import com.himanshu.ecommerce.entities.Order;
import com.himanshu.ecommerce.entities.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem,Integer> {

    List<OrderItem> findByOrder(Order order);
}
