package com.himanshu.ecommerce.service;

import com.himanshu.ecommerce.dto.JwtResponseDto;
import com.himanshu.ecommerce.dto.LoginRequestDto;
import com.himanshu.ecommerce.dto.UserRegistrationDto;
import com.himanshu.ecommerce.entities.Role;
import com.himanshu.ecommerce.entities.User;
import com.himanshu.ecommerce.exception.EmailAlreadyExistsException;
import com.himanshu.ecommerce.exception.InvalidPasswordException;
import com.himanshu.ecommerce.exception.PhoneNumberAlreadyExistsException;
import com.himanshu.ecommerce.exception.UserNotFoundException;
import com.himanshu.ecommerce.repository.UserRepository;
import com.himanshu.ecommerce.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public User registerUser(UserRegistrationDto userDto) {
        String email = userDto.getEmail()
                .trim()
                .toLowerCase(java.util.Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyExistsException("Email already registered");
        }

        if (userRepository.existsByPhoneNumber(userDto.getPhoneNumber().trim())) {
            throw new PhoneNumberAlreadyExistsException(
                    "Phone number already registered"
            );
        }

        User user = new User();

        user.setUsername(userDto.getUsername());
        user.setPhoneNumber(userDto.getPhoneNumber().trim());
        user.setEmail(email);

        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setRole(Role.USER);

        return userRepository.save(user);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public JwtResponseDto loginUser(LoginRequestDto loginRequest) {

        User user = findByEmail(loginRequest.getEmail());

        if (user == null) {
            throw new UserNotFoundException(
                    "User not found with email: " + loginRequest.getEmail());
        }

        if (!passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword())) {

            throw new InvalidPasswordException("Invalid password");
        }
        String token = jwtUtil.generateToken(user);

        return new JwtResponseDto(
                token,
                user.getEmail(),
                user.getRole().name()
        );
    }
}