package com.himanshu.ecommerce.config;

import com.himanshu.ecommerce.entities.Role;
import com.himanshu.ecommerce.entities.User;
import com.himanshu.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminDataLoader {

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${admin.phone}")
    private String adminPhone;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AdminDataLoader(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public CommandLineRunner createAdmin() {
        return args -> {

            String email = adminEmail.trim().toLowerCase();

            if (userRepository.findByEmail(email).isEmpty()) {

                User admin = new User();
                admin.setUsername("ADMIN");
                admin.setPhoneNumber(adminPhone.trim());
                admin.setEmail(email);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole(Role.ADMIN);

                userRepository.save(admin);
            }
        };
    }
}
