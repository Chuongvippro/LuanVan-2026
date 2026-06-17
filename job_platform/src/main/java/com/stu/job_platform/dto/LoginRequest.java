package com.stu.job_platform.dto;

public class LoginRequest {
    private String email;
    private String password;

    // Getter & Setter thuần
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}