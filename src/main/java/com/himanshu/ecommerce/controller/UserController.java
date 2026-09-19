package com.himanshu.ecommerce.controller;


import com.himanshu.ecommerce.dto.JwtResponseDto;
import com.himanshu.ecommerce.dto.LoginRequestDto;
import com.himanshu.ecommerce.dto.UserRegistrationDto;
import com.himanshu.ecommerce.entities.User;
import com.himanshu.ecommerce.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public User registerUser( @Valid @RequestBody UserRegistrationDto user) {
        return userService.registerUser(user);
    }



    @PostMapping("/login")
    public JwtResponseDto loginUser(
            @RequestBody LoginRequestDto loginRequest) {

        return userService.loginUser(loginRequest);
    }


}
