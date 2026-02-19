const nodemailer = require('nodemailer');

class EmailService {
	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST || 'smtp.gmail.com',
			port: process.env.EMAIL_PORT || 587,
			secure: false, // true para 465, false para otros puertos
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD
			}
		});
	}

	async sendPasswordResetEmail(email, resetToken) {
		const resetUrl = `${process.env.BASE_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
		
		const mailOptions = {
			from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
			to: email,
			subject: 'Recuperación de Contraseña',
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="UTF-8">
					<style>
						body {
							font-family: Arial, sans-serif;
							line-height: 1.6;
							color: #333;
						}
						.container {
							max-width: 600px;
							margin: 0 auto;
							padding: 20px;
							background-color: #f9f9f9;
						}
						.button {
							display: inline-block;
							padding: 12px 24px;
							background-color: #007bff;
							color: #ffffff;
							text-decoration: none;
							border-radius: 5px;
							margin: 20px 0;
						}
						.button:hover {
							background-color: #0056b3;
						}
						.warning {
							color: #dc3545;
							font-size: 12px;
							margin-top: 20px;
						}
					</style>
				</head>
				<body>
					<div class="container">
						<h2>Recuperación de Contraseña</h2>
						<p>Hola,</p>
						<p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
						<a href="${resetUrl}" class="button">Restablecer Contraseña</a>
						<p>O copia y pega este enlace en tu navegador:</p>
						<p>${resetUrl}</p>
						<p class="warning">⚠️ Este enlace expirará en 1 hora por seguridad.</p>
						<p>Si no solicitaste este cambio, ignora este correo.</p>
						<p>Saludos,<br>Equipo de Ecommerce</p>
					</div>
				</body>
				</html>
			`
		};

		try {
			await this.transporter.sendMail(mailOptions);
			return true;
		} catch (error) {
			console.error('Error al enviar email:', error);
			throw new Error('Error al enviar el correo de recuperación');
		}
	}
}

module.exports = EmailService;
