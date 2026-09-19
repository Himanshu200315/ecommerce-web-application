package com.himanshu.ecommerce.service;

import com.himanshu.ecommerce.dto.AddToCartRequestDto;
import com.himanshu.ecommerce.dto.CartItemResponseDto;
import com.himanshu.ecommerce.dto.UpdateCartItemRequestDto;
import com.himanshu.ecommerce.entities.Cart;
import com.himanshu.ecommerce.entities.CartItem;
import com.himanshu.ecommerce.entities.Product;
import com.himanshu.ecommerce.entities.User;
import com.himanshu.ecommerce.exception.ResourceNotFoundException;
import com.himanshu.ecommerce.repository.CartItemRepository;
import com.himanshu.ecommerce.repository.CartRepository;
import com.himanshu.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartItemServiceImpl implements CartItemService {

    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @Autowired
    public CartItemServiceImpl(CartItemRepository cartItemRepository, CartRepository cartRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    @Override
    public CartItemResponseDto addToCart(User user, AddToCartRequestDto request) {

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found"));

        Optional<CartItem> existingItem =
                cartItemRepository.findByCartAndProduct(cart, product);

        CartItem cartItem;

        if (existingItem.isPresent()) {

            cartItem = existingItem.get();

            cartItem.setQuantity(
                    cartItem.getQuantity() + request.getQuantity()
            );

        } else {

            cartItem = new CartItem();

            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
        }

        cartItem = cartItemRepository.save(cartItem);

        CartItemResponseDto response = new CartItemResponseDto();

        response.setCartItemId(cartItem.getId());
        response.setProductId(cartItem.getProduct().getId());
        response.setProductName(cartItem.getProduct().getName());
        response.setPrice(cartItem.getProduct().getPrice());
        response.setQuantity(cartItem.getQuantity());

        return response;
    }

    @Override
    public List<CartItemResponseDto> getCartItems(User user) {

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        List<CartItemResponseDto> response = new ArrayList<>();

        for (CartItem cartItem : cartItems) {

            CartItemResponseDto dto = new CartItemResponseDto();

            dto.setCartItemId(cartItem.getId());
            dto.setProductId(cartItem.getProduct().getId());
            dto.setProductName(cartItem.getProduct().getName());
            dto.setPrice(cartItem.getProduct().getPrice());
            dto.setQuantity(cartItem.getQuantity());

            response.add(dto);
        }

        return response;
    }

    @Override
    public CartItemResponseDto updateCartItem(
            User user,
            Long cartItemId,
            UpdateCartItemRequestDto request) {

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart not found"));

        CartItem cartItem = cartItemRepository
                .findByIdAndCart(cartItemId, cart)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart item not found"));

        cartItem.setQuantity(request.getQuantity());

        cartItem = cartItemRepository.save(cartItem);
        CartItemResponseDto response = new CartItemResponseDto();

        response.setCartItemId(cartItem.getId());
        response.setProductId(cartItem.getProduct().getId());
        response.setProductName(cartItem.getProduct().getName());
        response.setPrice(cartItem.getProduct().getPrice());
        response.setQuantity(cartItem.getQuantity());

        return response;
    }

    @Override
    public void deleteCartItem(User user, Long cartItemId) {


        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart not found"));


        CartItem cartItem = cartItemRepository
                .findByIdAndCart(cartItemId, cart)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart item not found"));


        cartItemRepository.delete(cartItem);
    }
}
