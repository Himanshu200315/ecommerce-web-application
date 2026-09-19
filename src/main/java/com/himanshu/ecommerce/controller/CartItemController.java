package com.himanshu.ecommerce.controller;

import com.himanshu.ecommerce.dto.AddToCartRequestDto;
import com.himanshu.ecommerce.dto.CartItemResponseDto;
import com.himanshu.ecommerce.dto.UpdateCartItemRequestDto;
import com.himanshu.ecommerce.entities.User;
import com.himanshu.ecommerce.service.CartItemService;
import com.himanshu.ecommerce.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart/items")
public class CartItemController {

    private final CartItemService cartItemService;
    private final UserService userService;

    @Autowired
    public CartItemController(
            CartItemService cartItemService,
            UserService userService) {

        this.cartItemService = cartItemService;
        this.userService = userService;
    }

    @PostMapping
    public CartItemResponseDto addToCart(
            @Valid @RequestBody AddToCartRequestDto request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userService.findByEmail(email);

        return cartItemService.addToCart(user, request);
    }

    @GetMapping
    public List<CartItemResponseDto> getCartItems() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.findByEmail(email);
        return cartItemService.getCartItems(user);

    }
    @PutMapping("/{cartItemId}")
    public CartItemResponseDto updateCartItem(
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequestDto request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userService.findByEmail(email);

        return cartItemService.updateCartItem(
                user,
                cartItemId,
                request
        );
    }
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<String> deleteCartItem(@PathVariable Long cartItemId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userService.findByEmail(email);

        cartItemService.deleteCartItem(user, cartItemId);

        return ResponseEntity.ok("Cart item deleted successfully");
    }

}