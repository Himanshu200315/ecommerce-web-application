package com.himanshu.ecommerce.dto;

import com.himanshu.ecommerce.entities.OrderStatus;
import com.himanshu.ecommerce.service.OrderService;

public class UpdateOrderStatusRequestDto {

    private OrderStatus status;
    public UpdateOrderStatusRequestDto() {
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
