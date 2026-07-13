package com.stu.job_platform.service;

public class CompanyEmailOtp {
    private String otpCode;
    private long expireTime;
    private boolean verified;

    public CompanyEmailOtp(String otpCode, long expireTime) {
        this.otpCode = otpCode;
        this.expireTime = expireTime;
        this.verified = false;
    }

    public String getOtpCode() { return otpCode; }
    public long getExpireTime() { return expireTime; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
}