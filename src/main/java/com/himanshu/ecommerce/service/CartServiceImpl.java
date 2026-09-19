package com.himanshu.ecommerce.service;

import com.himanshu.ecommerce.dto.CartResponseDto;
import com.himanshu.ecommerce.entities.Cart;
import com.himanshu.ecommerce.entities.User;
import com.himanshu.ecommerce.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CartServiceImpl  implements CartService{

    private final CartRepository cartRepository;


    @Autowired
    public CartServiceImpl(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @Override
    public CartResponseDto getCartByUser(User user) {

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
        CartResponseDto response = new CartResponseDto();
        response.setCartId(cart.getId());
        response.setUserId(cart.getUser().getId());
        response.setUsername(cart.getUser().getUsername());
        return response;
    }

    @Override
    public CartResponseDto createCart(User user) {

        Cart cart = new Cart();
        cart.setUser(user);

        cart = cartRepository.save(cart);

        CartResponseDto response = new CartResponseDto();
        response.setCartId(cart.getId());
        response.setUserId(cart.getUser().getId());
        response.setUsername(cart.getUser().getUsername());

        return response;
    }
}
