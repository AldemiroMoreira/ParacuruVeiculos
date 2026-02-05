const getHtmlTemplate = (title, message, buttonText, buttonUrl) => {
    // Brand Colors
    const primaryColor = '#0284c7'; // Sky 600 (Header)
    const buttonColor = '#22c55e';  // Green 500 (Action)
    const accentColor = '#f59e0b';  // Amber 500 (Highlight)

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Arial', sans-serif; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: ${primaryColor}; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px; }
        .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
        .button { display: inline-block; padding: 12px 24px; background-color: ${buttonColor}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
    </style>
</head>
<body>
    <div style="padding: 40px 0;">
        <div class="container">
            <div class="header">
                <div style="font-family: 'Arial', sans-serif; font-size: 28px; font-weight: bold;">
                    <span style="color: #ffffff;">PARACURU</span>
                    <span style="color: #f59e0b;">VEÍCULOS</span>
                </div>
            </div>
            <div class="content">
                <h2 style="color: #111827; margin-top: 0;">${title}</h2>
                <p>${message.replace(/\n/g, '<br>')}</p>
                
                ${buttonText && buttonUrl ? `
                <div style="text-align: center;">
                    <a href="${buttonUrl}" class="button">${buttonText}</a>
                </div>
                ` : ''}
                
                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Se você não solicitou isso, pode ignorar este email com segurança.</p>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Paracuru Veículos. Todos os direitos reservados.
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = { getHtmlTemplate };
