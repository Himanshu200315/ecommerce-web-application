package com.himanshu.ecommerce.service;

import com.himanshu.ecommerce.dto.CartResponseDto;
import com.himanshu.ecommerce.entities.Cart;
import com.himanshu.ecommerce.entities.User;

public interface CartService {

    CartResponseDto getCartByUser(User user);

    CartResponseDto createCart(User user);
}
