package com.himanshu.ecommerce.service;

import com.himanshu.ecommerce.dto.OrderItemResponseDto;
import com.himanshu.ecommerce.dto.OrderResponseDto;
import com.himanshu.ecommerce.dto.UpdateOrderStatusRequestDto;
import com.himanshu.ecommerce.entities.Cart;
import com.himanshu.ecommerce.entities.CartItem;
import com.himanshu.ecommerce.entities.Order;
import com.himanshu.ecommerce.entities.OrderItem;
import com.himanshu.ecommerce.entities.OrderStatus;
import com.himanshu.ecommerce.entities.User;
import com.himanshu.ecommerce.exception.InvalidOrderStatusException;
import com.himanshu.ecommerce.exception.ResourceNotFoundException;
import com.himanshu.ecommerce.repository.CartItemRepository;
import com.himanshu.ecommerce.repository.CartRepository;
import com.himanshu.ecommerce.repository.OrderItemRepository;
import com.himanshu.ecommerce.repository.OrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Autowired
    public OrderServiceImpl(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Transactional
    @Override
    public OrderResponseDto placeOrder(User user) {

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart not found"));

        List<CartItem> cartItems =
                cartItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {
            throw new ResourceNotFoundException("Cart is empty");
        }

        Order order = new Order();

        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        int totalAmount = 0;

        for (CartItem item : cartItems) {
            totalAmount +=
                    item.getQuantity() * item.getProduct().getPrice();
        }

        order.setTotalAmount(totalAmount);

        order = orderRepository.save(order);

        for (CartItem item : cartItems) {

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setProduct(item.getProduct());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(item.getProduct().getPrice());

            orderItemRepository.save(orderItem);
        }

        cartItemRepository.deleteAll(cartItems);

        return getOrderById(user, order.getId());
    }

    @Override
    public List<OrderResponseDto> getMyOrders(User user) {

        List<Order> orders = orderRepository.findByUser(user);

        List<OrderResponseDto> response = new ArrayList<>();

        for (Order order : orders) {

            OrderResponseDto dto = new OrderResponseDto();

            dto.setOrderId(order.getId());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setStatus(order.getStatus());
            dto.setCreatedAt(order.getCreatedAt());

            response.add(dto);
        }

        return response;
    }

    @Override
    public Page<OrderResponseDto> getAllOrders(Pageable pageable) {

        Page<Order> orders = orderRepository.findAll(pageable);

        return orders.map(order -> {

            OrderResponseDto dto = new OrderResponseDto();

            dto.setOrderId(order.getId());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setStatus(order.getStatus());
            dto.setCreatedAt(order.getCreatedAt());

            return dto;
        });
    }

    @Override
    public OrderResponseDto getOrderById(
            User user,
            Long orderId) {

        Order order = orderRepository
                .findByIdAndUser(orderId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"));

        List<OrderItem> orderItems =
                orderItemRepository.findByOrder(order);

        List<OrderItemResponseDto> itemResponses =
                new ArrayList<>();

        for (OrderItem item : orderItems) {

            OrderItemResponseDto itemDto =
                    new OrderItemResponseDto();

            itemDto.setProductId(
                    item.getProduct().getId());

            itemDto.setProductName(
                    item.getProduct().getName());

            itemDto.setQuantity(
                    item.getQuantity());

            itemDto.setPrice(
                    item.getPrice());

            itemResponses.add(itemDto);
        }

        OrderResponseDto response =
                new OrderResponseDto();

        response.setOrderId(order.getId());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setCreatedAt(order.getCreatedAt());
        response.setItems(itemResponses);

        return response;
    }

    @Override
    public OrderResponseDto updateOrderStatus(
            Long orderId,
            UpdateOrderStatusRequestDto request) {

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"));

        OrderStatus currentStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        if (currentStatus == OrderStatus.PENDING) {

            if (newStatus != OrderStatus.CONFIRMED
                    && newStatus != OrderStatus.CANCELLED) {

                throw new InvalidOrderStatusException(
                        "Invalid order status transition");
            }
        }

        if (currentStatus == OrderStatus.CONFIRMED) {

            if (newStatus != OrderStatus.SHIPPED
                    && newStatus != OrderStatus.CANCELLED) {

                throw new InvalidOrderStatusException(
                        "Invalid order status transition");
            }
        }

        if (currentStatus == OrderStatus.SHIPPED) {

            if (newStatus != OrderStatus.DELIVERED) {

                throw new InvalidOrderStatusException(
                        "Invalid order status transition");
            }
        }

        if (currentStatus == OrderStatus.DELIVERED
                || currentStatus == OrderStatus.CANCELLED) {

            throw new InvalidOrderStatusException(
                    "Order status cannot be changed");
        }

        order.setStatus(newStatus);

        order = orderRepository.save(order);

        List<OrderItem> orderItems =
                orderItemRepository.findByOrder(order);

        List<OrderItemResponseDto> itemResponses =
                new ArrayList<>();

        for (OrderItem item : orderItems) {

            OrderItemResponseDto itemDto =
                    new OrderItemResponseDto();

            itemDto.setProductId(item.getProduct().getId());
            itemDto.setProductName(item.getProduct().getName());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setPrice(item.getPrice());

            itemResponses.add(itemDto);
        }

        OrderResponseDto response =
                new OrderResponseDto();

        response.setOrderId(order.getId());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setCreatedAt(order.getCreatedAt());
        response.setItems(itemResponses);

        return response;
    }

    @Override
    @Transactional
    public OrderResponseDto cancelOrder(
            User user,
            Long orderId) {

        Order order = orderRepository
                .findByIdAndUser(orderId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"));

        OrderStatus currentStatus = order.getStatus();

        if (currentStatus != OrderStatus.PENDING
                && currentStatus != OrderStatus.CONFIRMED) {

            throw new InvalidOrderStatusException(
                    "Order cannot be cancelled at this stage");
        }

        order.setStatus(OrderStatus.CANCELLED);

        orderRepository.save(order);

        return getOrderById(user, orderId);
    }
    @Override
    public long getPendingOrderCount() {
        return orderRepository.countByStatus(OrderStatus.PENDING);
    }
}