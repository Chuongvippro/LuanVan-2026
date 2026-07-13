package com.stu.job_platform.service;

import com.stu.job_platform.dto.RegisterRequest;

public class PendingRegistration {
    private RegisterRequest request;
    private String otpCode;
    private long expireTime;

    public PendingRegistration(RegisterRequest request, String otpCode, long expireTime) {
        this.request = request;
        this.otpCode = otpCode;
        this.expireTime = expireTime;
    }
    // getters
    public RegisterRequest getRequest() { return request; }
    public String getOtpCode() { return otpCode; }
    public long getExpireTime() { return expireTime; }
}