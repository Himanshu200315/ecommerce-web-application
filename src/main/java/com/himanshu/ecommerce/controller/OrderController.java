package com.himanshu.ecommerce.controller;

import com.himanshu.ecommerce.dto.OrderResponseDto;
import com.himanshu.ecommerce.dto.UpdateOrderStatusRequestDto;
import com.himanshu.ecommerce.entities.User;
import com.himanshu.ecommerce.service.OrderService;
import com.himanshu.ecommerce.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    @Autowired
    public OrderController(
            OrderService orderService,
            UserService userService) {

        this.orderService = orderService;
        this.userService = userService;
    }

    @PostMapping
    public OrderResponseDto placeOrder() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userService.findByEmail(email);

        return orderService.placeOrder(user);
    }

    @GetMapping
    public List<OrderResponseDto> getMyOrders() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userService.findByEmail(email);

        return orderService.getMyOrders(user);
    }

    @GetMapping("/{orderId}")
    public OrderResponseDto getOrderById(
            @PathVariable Long orderId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userService.findByEmail(email);

        return orderService.getOrderById(user, orderId);
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public OrderResponseDto updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequestDto request) {

        return orderService.updateOrderStatus(
                orderId,
                request
        );
    }

    @PostMapping("/{orderId}/cancel")
    public OrderResponseDto cancelOrder(
            @PathVariable Long orderId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userService.findByEmail(email);

        return orderService.cancelOrder(user, orderId);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<OrderResponseDto> getAllOrders(Pageable pageable) {
        return orderService.getAllOrders(pageable);
    }

    @GetMapping("/admin/pending-count")
    @PreAuthorize("hasRole('ADMIN')")
    public long getPendingOrderCount() {
        return orderService.getPendingOrderCount();
    }
}
