package com.himanshu.ecommerce.service;

import com.himanshu.ecommerce.dto.AddToCartRequestDto;
import com.himanshu.ecommerce.dto.CartItemResponseDto;

import com.himanshu.ecommerce.dto.UpdateCartItemRequestDto;
import com.himanshu.ecommerce.entities.User;

import java.util.List;

public interface CartItemService {

    CartItemResponseDto addToCart(User user, AddToCartRequestDto request);
    List<CartItemResponseDto> getCartItems(User user);
    CartItemResponseDto updateCartItem(User user, Long cartItemId, UpdateCartItemRequestDto request);
    void deleteCartItem(User user, Long cartItemId);


}
