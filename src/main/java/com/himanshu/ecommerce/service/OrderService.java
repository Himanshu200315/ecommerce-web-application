package com.himanshu.ecommerce.service;

import com.himanshu.ecommerce.dto.OrderResponseDto;
import com.himanshu.ecommerce.dto.UpdateOrderStatusRequestDto;
import com.himanshu.ecommerce.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {

    OrderResponseDto placeOrder(User user);

    List<OrderResponseDto> getMyOrders(User user);

    OrderResponseDto getOrderById(User user, Long orderId);

    OrderResponseDto updateOrderStatus(
            Long orderId,
            UpdateOrderStatusRequestDto request
    );

    OrderResponseDto cancelOrder(User user, Long orderId);

    Page<OrderResponseDto> getAllOrders(Pageable pageable);
    long getPendingOrderCount();
}
