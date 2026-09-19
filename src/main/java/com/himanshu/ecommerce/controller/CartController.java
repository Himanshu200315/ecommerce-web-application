package com.himanshu.ecommerce.controller;

import com.himanshu.ecommerce.dto.CartResponseDto;
import com.himanshu.ecommerce.entities.Cart;
import com.himanshu.ecommerce.entities.User;
import com.himanshu.ecommerce.service.CartService;
import com.himanshu.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;
    private final UserService userService;
    @Autowired
    public CartController(CartService cartService , UserService userService) {
        this.cartService = cartService;
        this.userService = userService;
    }

    @GetMapping
    public CartResponseDto getMyCart() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();//Give me the name/identity that was stored in Authentication not is email.

        User user = userService.findByEmail(email);
        CartResponseDto cart = cartService.getCartByUser(user);

        return cart;

    }

}
