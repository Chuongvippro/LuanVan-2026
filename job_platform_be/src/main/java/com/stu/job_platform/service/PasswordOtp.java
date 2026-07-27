package com.stu.job_platform.service;

public class PasswordOtp {
        private final String otpCode;
        private final long expireTime;

        public PasswordOtp(String otpCode, long expireTime) {
            this.otpCode = otpCode;
            this.expireTime = expireTime;
        }

        public String getOtpCode() {
            return otpCode;
        }

        public long getExpireTime() {
            return expireTime;
        }
}
