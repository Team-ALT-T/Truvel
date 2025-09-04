package alt_t.truvel.auth.emailVerification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class EmailSenderService	 {

    private final JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String from;
    public void sendEmail(String to, String subject, String text) {
         // application.properties에 설정한 발신자 이메일 주소
        log.debug("Sending email from: {}", from);
        log.debug("Sending email to: {}", to);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);                          // 수신자
        message.setSubject(subject);                // 제목
        message.setText(text);                      // 본문 (인증코드 포함)
        message.setFrom(from);      // 발신자 (Gmail 주소 그대로 써도 됨)
        mailSender.send(message);
        log.debug("Email sent successfully to: {}", to);
    }
}