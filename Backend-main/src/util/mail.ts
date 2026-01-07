export const createVerificationEmail = (
  name: string,
  verificationLink: string,
  locale: string = 'en',
) => {
  const isTurkish = locale === 'tr';

  const subject = isTurkish ? 'Simmortals Hesabınızı Doğrulayın' : 'Verify Your Simmortals Account';

  const content = isTurkish
    ? {
        title: "Simmortals'a Hoş Geldiniz!",
        greeting: `Merhaba <strong>${name}</strong>,`,
        mainText:
          'Lütfen aşağıdaki düğmeye tıklayarak Simmortals hesabınızı doğrulayın. Bu, hesabınızın güvenliğini sağlamamıza ve kaydınızı tamamlamamıza yardımcı olur.',
        buttonText: 'Hesabınızı Doğrulayın',
        fallbackText:
          'Yukarıdaki düğme çalışmazsa, bu bağlantıyı kopyalayıp tarayıcınıza yapıştırabilirsiniz:',
        disclaimer:
          'Eğer Simmortals hesabı oluşturmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz.',
        footer: {
          copyright: '&copy; 2025 Simmortals. Tüm hakları saklıdır.',
          contact:
            'Sorularınız için <a href="mailto:contact@simmortals.com" style="color: #c517db; text-decoration: none;">contact@simmortals.com</a> adresinden bize ulaşabilirsiniz',
        },
      }
    : {
        title: 'Welcome to Simmortals!',
        greeting: `Hello <strong>${name}</strong>,`,
        mainText:
          'Please verify your Simmortals account by clicking the button below. This helps us ensure the security of your account and complete your registration.',
        buttonText: 'Verify Your Account',
        fallbackText:
          "If the button above doesn't work, you can copy and paste this link into your browser:",
        disclaimer: "If you didn't create a Simmortals account, you can safely ignore this email.",
        footer: {
          copyright: '&copy; 2025 Simmortals. All rights reserved.',
          contact:
            'If you have any questions, contact us at <a href="mailto:contact@simmortals.com" style="color: #c517db; text-decoration: none;">contact@simmortals.com</a>',
        },
      };

  return {
    subject,
    html: `<!DOCTYPE html>
<html lang="${isTurkish ? 'tr' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Logo Section -->
        <div style="text-align: center; margin-bottom: 40px;">
            <!-- Replace with your actual logo -->
            <img src="https://simmortals.com/mail-logo.png" alt="Simmortals Logo" style="max-width: 200px; height: auto;">
        </div>

        <!-- Main Content -->
        <div style="background-color: #111111; border-radius: 12px; padding: 40px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 30px 0; font-size: 28px; font-weight: 600; text-align: center; color: #ffffff;">
                ${content.title}
            </h1>

            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #ffffff;">
                ${content.greeting}
            </p>

            <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #ffffff;">
                ${content.mainText}
            </p>

            <!-- Verify Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="${verificationLink}" style="display: inline-block; background-color: #c517db; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: background-color 0.2s;">
                    ${content.buttonText}
                </a>
            </div>

            <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #cccccc;">
                ${content.fallbackText}
            </p>

            <!-- Copy Link Section -->
            <div style="background-color: #222222; padding: 15px; border-radius: 6px; margin-bottom: 30px; word-break: break-all;">
                <p style="margin: 0; font-size: 14px; color: #c517db; font-family: monospace;">
                    ${verificationLink}
                </p>
            </div>

            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #cccccc;">
                ${content.disclaimer}
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #666666; font-size: 12px; line-height: 1.4;">
            <p style="margin: 0 0 10px 0;">
                ${content.footer.copyright}
            </p>
            <p style="margin: 0;">
                ${content.footer.contact}
            </p>
        </div>
    </div>
</body>
</html>`,
  };
};

export const createWelcomeEmail = (name: string, locale: string = 'en') => {
  const isTurkish = locale === 'tr';

  const subject = isTurkish ? "Simmortals'a Hoş Geldiniz!" : 'Welcome to Simmortals!';

  const content = isTurkish
    ? {
        title: "Simmortals'a Hoş Geldiniz!",
        greeting: `Merhaba <strong>${name}</strong>,`,
        mainText:
          'Simmortals ailesine katıldığınız için teşekkür ederiz! Hesabınız başarıyla oluşturuldu ve artık platformumuzun tüm özelliklerini kullanmaya hazırsınız.',
        buttonText: 'Başlayın',
        buttonHref: 'https://simmortals.com',
        features: {
          title: 'Neler yapabilirsiniz:',
          items: [
            'Sevdiklerinizin anılarını ölümsüzleştirin',
            'Kişiselleştirilmiş anma sayfaları oluşturun',
            'Topluluğumuzla anıları paylaşın',
          ],
        },
        closing: 'Sizinle birlikte olmaktan mutluluk duyuyoruz!',
        footer: {
          copyright: '&copy; 2025 Simmortals. Tüm hakları saklıdır.',
          contact:
            'Sorularınız için <a href="mailto:contact@simmortals.com" style="color: #c517db; text-decoration: none;">contact@simmortals.com</a> adresinden bize ulaşabilirsiniz',
        },
      }
    : {
        title: 'Welcome to Simmortals!',
        greeting: `Hello <strong>${name}</strong>,`,
        mainText:
          "Thank you for joining the Simmortals family! Your account has been successfully created and you're now ready to explore all the features of our platform.",
        buttonText: 'Get Started',
        buttonHref: 'https://simmortals.com',
        features: {
          title: 'What you can do:',
          items: [
            'Immortalize memories of your loved ones',
            'Create personalized memorial pages',
            'Share memories with our community',
          ],
        },
        closing: "We're excited to have you with us!",
        footer: {
          copyright: '&copy; 2025 Simmortals. All rights reserved.',
          contact:
            'If you have any questions, contact us at <a href="mailto:contact@simmortals.com" style="color: #c517db; text-decoration: none;">contact@simmortals.com</a>',
        },
      };

  return {
    subject,
    html: `<!DOCTYPE html>
<html lang="${isTurkish ? 'tr' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Logo Section -->
        <div style="text-align: center; margin-bottom: 40px;">
            <!-- Replace with your actual logo -->
            <img src="https://simmortals.com/mail-logo.png" alt="Simmortals Logo" style="max-width: 200px; height: auto;">
        </div>

        <!-- Main Content -->
        <div style="background-color: #111111; border-radius: 12px; padding: 40px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 30px 0; font-size: 28px; font-weight: 600; text-align: center; color: #ffffff;">
                ${content.title}
            </h1>

            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #ffffff;">
                ${content.greeting}
            </p>

            <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #ffffff;">
                ${content.mainText}
            </p>

            <!-- Primary Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="${content.buttonHref}" style="display: inline-block; background-color: #c517db; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: background-color 0.2s;">
                    ${content.buttonText}
                </a>
            </div>

            <!-- Features Section (keeps same dark palette as other emails) -->
            <div style="background-color: #222222; border-radius: 6px; padding: 25px; margin-bottom: 20px;">
                <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                    ${content.features.title}
                </p>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #cccccc; font-size: 14px; line-height: 1.8;">
                    ${content.features.items.map((item) => `<li>${item}</li>`).join('\n                    ')}
                </ul>
            </div>

            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #cccccc; text-align: center;">
                ${content.closing}
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #666666; font-size: 12px; line-height: 1.4;">
            <p style="margin: 0 0 10px 0;">
                ${content.footer.copyright}
            </p>
            <p style="margin: 0;">
                ${content.footer.contact}
            </p>
        </div>
    </div>
</body>
</html>`,
  };
};

export const createPasswordResetEmail = (
  email: string,
  resetLink: string,
  locale: string = 'en',
) => {
  const isTurkish = locale === 'tr';

  const subject = isTurkish ? 'Simmortals Şifrenizi Sıfırlayın' : 'Reset Your Simmortals Password';

  const content = isTurkish
    ? {
        title: 'Şifrenizi Sıfırlayın',
        greeting: 'Merhaba,',
        mainText: `Simmortals hesabınız (<strong>${email}</strong>) için şifre sıfırlama talebi aldık. Yeni bir şifre oluşturmak için aşağıdaki düğmeye tıklayın.`,
        buttonText: 'Şifreyi Sıfırla',
        fallbackText:
          'Yukarıdaki düğme çalışmazsa, bu bağlantıyı kopyalayıp tarayıcınıza yapıştırabilirsiniz:',
        expirationText:
          'Bu şifre sıfırlama bağlantısı güvenlik nedenleriyle 1 saat içinde sona erecektir.',
        disclaimer:
          'Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz. Şifreniz değişmeden kalacaktır.',
        footer: {
          copyright: '&copy; 2025 Simmortals. Tüm hakları saklıdır.',
          contact:
            'Sorularınız için <a href="mailto:contact@simmortals.com" style="color: #c517db; text-decoration: none;">contact@simmortals.com</a> adresinden bize ulaşabilirsiniz',
        },
      }
    : {
        title: 'Reset Your Password',
        greeting: 'Hello,',
        mainText: `We received a request to reset the password for your Simmortals account (<strong>${email}</strong>). Click the button below to create a new password.`,
        buttonText: 'Reset Password',
        fallbackText:
          "If the button above doesn't work, you can copy and paste this link into your browser:",
        expirationText: 'This password reset link will expire in 1 hour for security reasons.',
        disclaimer:
          "If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.",
        footer: {
          copyright: '&copy; 2025 Simmortals. All rights reserved.',
          contact:
            'If you have any questions, contact us at <a href="mailto:contact@simmortals.com" style="color: #c517db; text-decoration: none;">contact@simmortals.com</a>',
        },
      };

  return {
    subject,
    html: `<!DOCTYPE html>
<html lang="${isTurkish ? 'tr' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Logo Section -->
        <div style="text-align: center; margin-bottom: 40px;">
            <!-- Replace with your actual logo -->
            <img src="https://simmortals.com/mail-logo.png" alt="Simmortals Logo" style="max-width: 200px; height: auto;">
        </div>

        <!-- Main Content -->
        <div style="background-color: #111111; border-radius: 12px; padding: 40px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 30px 0; font-size: 28px; font-weight: 600; text-align: center; color: #ffffff;">
                ${content.title}
            </h1>

            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #ffffff;">
                ${content.greeting}
            </p>

            <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #ffffff;">
                ${content.mainText}
            </p>

            <!-- Reset Password Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="${resetLink}" style="display: inline-block; background-color: #c517db; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: background-color 0.2s;">
                    ${content.buttonText}
                </a>
            </div>

            <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #cccccc;">
                ${content.fallbackText}
            </p>

            <!-- Copy Link Section -->
            <div style="background-color: #222222; padding: 15px; border-radius: 6px; margin-bottom: 30px; word-break: break-all;">
                <p style="margin: 0; font-size: 14px; color: #c517db; font-family: monospace;">
                    ${resetLink}
                </p>
            </div>

            <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6; color: #cccccc;">
                ${content.expirationText}
            </p>

            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #cccccc;">
                ${content.disclaimer}
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #666666; font-size: 12px; line-height: 1.4;">
            <p style="margin: 0 0 10px 0;">
                ${content.footer.copyright}
            </p>
            <p style="margin: 0;">
                ${content.footer.contact}
            </p>
        </div>
    </div>
</body>
</html>`,
  };
};
