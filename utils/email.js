const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// new Email(user, url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Alex Sidorenko <${process.env.EMAIL_FROM}>`;
  }
  //THIS WILL ONLY WORK IN PRODUCTION!!!
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //sendGrid// also nodemailer works well with SMTP version of Sendgrid. Thats why we dont need to pass port or service because it already knows from nodemailer
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  //send the actual email
  async send(template, subject) {
    //1) Render the html for the email based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
    //2) Define the email options
    const mailOptions = {
      from: process.env.SENDGRID_EMAIL_FROM,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html) // npm package--htmltotext
      // html :
    };

    //3) Create a transport and send email

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
