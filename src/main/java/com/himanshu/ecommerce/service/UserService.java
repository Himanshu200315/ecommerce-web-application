package com.himanshu.ecommerce.service;

import com.himanshu.ecommerce.dto.JwtResponseDto;
import com.himanshu.ecommerce.dto.LoginRequestDto;
import com.himanshu.ecommerce.dto.UserRegistrationDto;
import com.himanshu.ecommerce.entities.User;

public interface UserService {

    User registerUser(UserRegistrationDto user);

    User findByEmail(String email);

    JwtResponseDto loginUser(LoginRequestDto loginRequest);

}
