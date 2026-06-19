package com.stu.job_platform.controller;

import com.stu.job_platform.dto.RegisterRequest;
import com.stu.job_platform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5173") 
public class UserController {

    @Autowired
    private UserService userService;

    // Giữ đúng 1 endpoint gốc, nhận vào object DTO tổng hợp
    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return userService.registerUser(request);
    }
}