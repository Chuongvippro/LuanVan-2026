package com.stu.job_platform.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otpCode) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("chuongvl2k4@gmail.com", "Tìm Việc Hay");
        helper.setTo(toEmail);
        helper.setSubject("Mã OTP xác thực tài khoản");
        helper.setText(
            "<p>Mã OTP của bạn là: <b style=\"color:red; font-size:20px;\">"
            + otpCode + "</b>. Có hiệu lực 5 phút.</p>", true);

        mailSender.send(message);
    }
}